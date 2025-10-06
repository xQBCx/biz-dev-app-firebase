import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { 
  Search,
  Star,
  Users,
  Mail,
  MessageSquare,
  BarChart3,
  Globe,
  DollarSign,
  FileText,
  Calendar,
  Package,
  TrendingUp,
  Target,
  Megaphone,
  Database,
  Shield,
  Zap,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  ShoppingCart,
  Settings,
  Cloud,
  Lock,
  Workflow
} from "lucide-react";

type Tool = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: any;
  price: string;
  rating: number;
  reviews: number;
  features: string[];
  popular?: boolean;
  installed?: boolean;
};

const tools: Tool[] = [
  {
    id: "crm",
    name: "Business CRM Pro",
    description: "Complete customer relationship management with pipeline tracking and automation",
    category: "Sales & CRM",
    icon: Users,
    price: "Included",
    rating: 4.8,
    reviews: 1243,
    features: ["Contact Management", "Pipeline Tracking", "Email Integration", "Sales Automation"],
    popular: true,
    installed: true
  },
  {
    id: "email",
    name: "Email Marketing Hub",
    description: "Create, send, and track email campaigns with advanced automation",
    category: "Marketing",
    icon: Mail,
    price: "Included",
    rating: 4.7,
    reviews: 892,
    features: ["Campaign Builder", "A/B Testing", "Analytics", "Automation Workflows"],
    popular: true,
    installed: false
  },
  {
    id: "sms",
    name: "SMS Campaign Manager",
    description: "Bulk SMS messaging with personalization and delivery tracking",
    category: "Marketing",
    icon: MessageSquare,
    price: "$0.02/msg",
    rating: 4.6,
    reviews: 567,
    features: ["Bulk SMS", "2-Way Messaging", "Scheduling", "Contact Lists"],
    installed: false
  },
  {
    id: "analytics",
    name: "Business Analytics",
    description: "Comprehensive analytics dashboard with real-time insights",
    category: "Analytics",
    icon: BarChart3,
    price: "Included",
    rating: 4.9,
    reviews: 1456,
    features: ["Real-time Data", "Custom Reports", "ROI Tracking", "Export Tools"],
    popular: true,
    installed: true
  },
  {
    id: "seo",
    name: "Local SEO Optimizer",
    description: "Improve local search rankings and manage online listings",
    category: "Marketing",
    icon: Globe,
    price: "$49/mo",
    rating: 4.7,
    reviews: 734,
    features: ["Keyword Research", "Listing Management", "Rank Tracking", "Competitor Analysis"],
    installed: false
  },
  {
    id: "invoicing",
    name: "Invoice & Billing",
    description: "Professional invoicing with payment processing and reminders",
    category: "Finance",
    icon: DollarSign,
    price: "Included",
    rating: 4.8,
    reviews: 923,
    features: ["Invoice Creation", "Payment Processing", "Recurring Billing", "Expense Tracking"],
    installed: true
  },
  {
    id: "contracts",
    name: "Contract Manager",
    description: "E-signature ready contracts with templates and tracking",
    category: "Operations",
    icon: FileText,
    price: "Included",
    rating: 4.6,
    reviews: 445,
    features: ["Templates", "E-Signatures", "Version Control", "Reminders"],
    installed: false
  },
  {
    id: "scheduling",
    name: "Appointment Scheduler",
    description: "Online booking and calendar management for your team",
    category: "Operations",
    icon: Calendar,
    price: "Included",
    rating: 4.7,
    reviews: 678,
    features: ["Online Booking", "Calendar Sync", "Reminders", "Team Scheduling"],
    installed: true
  },
  {
    id: "inventory",
    name: "Inventory Management",
    description: "Track products, manage stock levels, and automate reordering",
    category: "Operations",
    icon: Package,
    price: "$29/mo",
    rating: 4.5,
    reviews: 334,
    features: ["Stock Tracking", "Low Stock Alerts", "Barcode Scanning", "Reports"],
    installed: false
  },
  {
    id: "social",
    name: "Social Media Manager",
    description: "Schedule posts, monitor engagement, and analyze performance",
    category: "Marketing",
    icon: Megaphone,
    price: "Included",
    rating: 4.8,
    reviews: 1123,
    features: ["Multi-Platform", "Post Scheduling", "Analytics", "Content Calendar"],
    popular: true,
    installed: true
  },
  {
    id: "leads",
    name: "Lead Generation Pro",
    description: "Capture and qualify leads with smart forms and scoring",
    category: "Sales & CRM",
    icon: Target,
    price: "$39/mo",
    rating: 4.6,
    reviews: 556,
    features: ["Smart Forms", "Lead Scoring", "Qualification", "Integration"],
    installed: false
  },
  {
    id: "reputation",
    name: "Review Management",
    description: "Monitor and respond to reviews across all platforms",
    category: "Marketing",
    icon: Star,
    price: "$19/mo",
    rating: 4.9,
    reviews: 892,
    features: ["Review Monitoring", "Response Templates", "Sentiment Analysis", "Reporting"],
    installed: false
  },
  {
    id: "cloud-storage",
    name: "Cloud Storage Pro",
    description: "Secure document storage and file sharing with your team",
    category: "Operations",
    icon: Cloud,
    price: "Included",
    rating: 4.8,
    reviews: 1234,
    features: ["Unlimited Storage", "File Sharing", "Version Control", "Team Collaboration"],
    installed: true
  },
  {
    id: "security",
    name: "Security Suite",
    description: "Advanced security monitoring and threat protection",
    category: "Security",
    icon: Shield,
    price: "Included",
    rating: 4.9,
    reviews: 789,
    features: ["Threat Detection", "Data Encryption", "Access Control", "Audit Logs"],
    popular: true,
    installed: true
  },
  {
    id: "workflow",
    name: "Workflow Automation",
    description: "Automate repetitive tasks and streamline business processes",
    category: "Operations",
    icon: Workflow,
    price: "$79/mo",
    rating: 4.7,
    reviews: 456,
    features: ["Visual Builder", "Integrations", "Triggers & Actions", "Scheduling"],
    installed: false
  }
];

const categories = [
  { name: "All Tools", count: tools.length },
  { name: "Sales & CRM", count: tools.filter(t => t.category === "Sales & CRM").length },
  { name: "Marketing", count: tools.filter(t => t.category === "Marketing").length },
  { name: "Analytics", count: tools.filter(t => t.category === "Analytics").length },
  { name: "Finance", count: tools.filter(t => t.category === "Finance").length },
  { name: "Operations", count: tools.filter(t => t.category === "Operations").length },
  { name: "Security", count: tools.filter(t => t.category === "Security").length }
];

const Tools = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState("All Tools");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  const filteredTools = tools.filter(tool => {
    const matchesCategory = selectedCategory === "All Tools" || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const installedCount = tools.filter(t => t.installed).length;

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-foreground via-chrome to-foreground bg-clip-text text-transparent">
            Everything You Need to Scale
          </h2>
          <p className="text-xl text-muted-foreground mb-6">
            Complete business toolkit - from CRM to analytics, all in one platform
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Tools", value: tools.length, icon: Package },
              { label: "Active Tools", value: installedCount, icon: CheckCircle2 },
              { label: "Categories", value: categories.length - 1, icon: Settings },
              { label: "Avg Rating", value: "4.7★", icon: Star }
            ].map((stat, idx) => (
              <Card key={idx} className="p-4 shadow-elevated border border-border">
                <div className="flex items-center gap-3">
                  <stat.icon className="w-8 h-8 text-primary" />
                  <div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search tools..."
              className="pl-12 h-12 text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${categories.length}, 1fr)` }}>
            {categories.map((cat) => (
              <TabsTrigger key={cat.name} value={cat.name} className="flex-col py-3 text-xs lg:text-sm">
                <span className="font-semibold">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Popular Tools Banner */}
        {selectedCategory === "All Tools" && (
          <Card className="p-6 mb-8 bg-gradient-primary border-0 shadow-glow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-primary-foreground" />
                <div>
                  <h3 className="text-xl font-bold text-primary-foreground">Most Popular Tools</h3>
                  <p className="text-sm text-primary-foreground/80">Highly rated by verified business owners</p>
                </div>
              </div>
              <Badge className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30">
                {tools.filter(t => t.popular).length} Featured
              </Badge>
            </div>
          </Card>
        )}

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            
            return (
              <Card 
                key={tool.id} 
                className={`p-6 shadow-elevated border transition-all hover:shadow-glow ${
                  tool.popular ? "border-primary/50" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-chrome">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{tool.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  {tool.popular && (
                    <Badge className="bg-primary/10 text-primary border-primary/30">
                      Popular
                    </Badge>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4">{tool.description}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-primary text-primary" />
                    <span className="font-semibold">{tool.rating}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({tool.reviews} reviews)</span>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-4">
                  {tool.features.slice(0, 3).map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-primary" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-primary">{tool.price}</div>
                    {tool.price !== "Included" && (
                      <div className="text-xs text-muted-foreground">per month</div>
                    )}
                  </div>
                  {tool.installed ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (tool.id === "crm") navigate("/crm");
                        else if (tool.id === "analytics") navigate("/dashboard");
                      }}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Tool
                    </Button>
                  ) : (
                    <Button size="sm">
                      Install
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredTools.length === 0 && (
          <Card className="p-12 text-center shadow-elevated border border-border">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground">Try adjusting your search or category filter</p>
          </Card>
        )}

        {/* CTA */}
        <Card className="p-8 mt-12 bg-card border-2 border-primary/30 shadow-elevated">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">Need a Custom Tool?</h3>
              <p className="text-muted-foreground mb-4">
                Our Dev AI agent can build custom integrations and workflows tailored to your business needs.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Custom API integrations
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Automated workflows
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Business-specific solutions
                </li>
              </ul>
            </div>
            <Button size="lg" variant="chrome" onClick={() => navigate("/dashboard")}>
              Talk to Dev AI
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tools;