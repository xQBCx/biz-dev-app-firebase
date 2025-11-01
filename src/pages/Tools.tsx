import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
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
  Workflow,
  Bot,
  Phone,
  ThumbsUp,
  Share2,
  MonitorSmartphone,
  Briefcase,
  CreditCard,
  LayoutDashboard,
  Building2,
  Palette,
  Wrench,
  Map,
  Send,
  TrendingDown,
  Eye,
  Code,
  ShieldCheck,
  Network,
  Boxes,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Store,
  UserCheck,
  Layers,
  Link,
  GraduationCap,
  GitBranch,
  Headphones
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
  // AI Tools
  {
    id: "ai-web-chat",
    name: "AI Web Chat",
    description: "AI-powered website chat that captures leads and answers questions 24/7",
    category: "AI Tools",
    icon: MessageSquare,
    price: "Included",
    rating: 4.9,
    reviews: 1543,
    features: ["24/7 Availability", "Lead Capture", "Smart Responses", "Multi-language"],
    popular: true,
    installed: false
  },
  {
    id: "conversations-ai",
    name: "Conversations AI",
    description: "Automates customer messaging to book appointments and qualify leads",
    category: "AI Tools",
    icon: Bot,
    price: "Included",
    rating: 4.8,
    reviews: 1234,
    features: ["Appointment Booking", "Lead Qualification", "SMS & Chat", "CRM Integration"],
    popular: true,
    installed: false
  },
  {
    id: "ai-receptionist",
    name: "AI Receptionist",
    description: "Professional AI receptionist for call and chat handling",
    category: "AI Tools",
    icon: Phone,
    price: "$99/mo",
    rating: 4.7,
    reviews: 892,
    features: ["Call Handling", "Appointment Scheduling", "Lead Capture", "Voicemail Transcription"],
    installed: false
  },
  {
    id: "ai-workforce",
    name: "AI Workforce",
    description: "AI features embedded across sales, marketing, and fulfillment workflows",
    category: "AI Tools",
    icon: Users,
    price: "Included",
    rating: 4.9,
    reviews: 2156,
    features: ["Sales Automation", "Marketing AI", "Content Generation", "Task Automation"],
    popular: true,
    installed: false
  },
  
  // CRM & Sales
  {
    id: "white-label-crm",
    name: "White-label CRM",
    description: "Pipeline, deals, and contact management designed to sell under your own brand",
    category: "Sales & CRM",
    icon: Briefcase,
    price: "Included",
    rating: 4.8,
    reviews: 1876,
    features: ["Pipeline Management", "Deal Tracking", "Contact Management", "White-label Ready"],
    popular: true,
    installed: true
  },
  {
    id: "yesware",
    name: "Yesware",
    description: "Sales email tracking and templates to speed up outreach from the inbox",
    category: "Sales & CRM",
    icon: Mail,
    price: "$15/mo",
    rating: 4.6,
    reviews: 567,
    features: ["Email Tracking", "Templates", "Analytics", "Gmail Integration"],
    installed: false
  },
  
  // Reputation & Reviews
  {
    id: "reputation-management",
    name: "Reputation Management",
    description: "Centralizes reviews, mentions, and ratings to monitor and improve online reputation",
    category: "Reputation",
    icon: ThumbsUp,
    price: "$49/mo",
    rating: 4.9,
    reviews: 1654,
    features: ["Review Monitoring", "Response Management", "Sentiment Analysis", "Multi-platform"],
    popular: true,
    installed: false
  },
  {
    id: "review-management-service",
    name: "Review Management (Service)",
    description: "Team responds to every review to build trust and improve ratings",
    category: "Services",
    icon: Headphones,
    price: "$299/mo",
    rating: 4.8,
    reviews: 432,
    features: ["Professional Responses", "24/7 Monitoring", "Review Generation", "Reporting"],
    installed: false
  },
  
  // Social Media
  {
    id: "social-marketing",
    name: "Social Marketing",
    description: "Manages posting, engagement, and reporting across multiple social networks",
    category: "Marketing",
    icon: Share2,
    price: "Included",
    rating: 4.7,
    reviews: 1234,
    features: ["Multi-platform Posting", "Scheduling", "Analytics", "Engagement Tracking"],
    popular: true,
    installed: true
  },
  {
    id: "social-media-service",
    name: "Social Media Management (Service)",
    description: "Content creation and engagement handled by a fulfillment team",
    category: "Services",
    icon: Megaphone,
    price: "$499/mo",
    rating: 4.8,
    reviews: 321,
    features: ["Content Creation", "Daily Posting", "Community Management", "Reporting"],
    installed: false
  },
  
  // Local SEO
  {
    id: "local-seo",
    name: "Local SEO",
    description: "AI-assisted listings and visibility tools to boost local search rankings",
    category: "SEO",
    icon: Map,
    price: "$79/mo",
    rating: 4.8,
    reviews: 1432,
    features: ["Listing Management", "Rank Tracking", "Citation Building", "Local Keywords"],
    popular: true,
    installed: false
  },
  {
    id: "listings-management-service",
    name: "Listings Management (Service)",
    description: "Specialists verify and maintain accurate business listings everywhere",
    category: "Services",
    icon: Globe,
    price: "$149/mo",
    rating: 4.7,
    reviews: 678,
    features: ["Listing Verification", "Directory Submissions", "Duplicate Suppression", "Updates"],
    installed: false
  },
  {
    id: "listing-sync-pro",
    name: "Listing Sync Pro",
    description: "Publishes consistent business info to 40+ directories and suppresses duplicates",
    category: "SEO",
    icon: Network,
    price: "$29/mo",
    rating: 4.6,
    reviews: 543,
    features: ["40+ Directories", "Auto-sync", "Duplicate Detection", "Status Monitoring"],
    installed: false
  },
  {
    id: "alpha-seo",
    name: "Alpha SEO",
    description: "Managed on-site and off-site SEO fulfillment with reporting",
    category: "SEO",
    icon: TrendingUp,
    price: "$499/mo",
    rating: 4.8,
    reviews: 234,
    features: ["On-page SEO", "Link Building", "Content Optimization", "Monthly Reports"],
    installed: false
  },
  {
    id: "boostability-seo",
    name: "Boostability SEO",
    description: "Outsourced SEO fulfillment focused on SMB outcomes",
    category: "SEO",
    icon: Zap,
    price: "$399/mo",
    rating: 4.7,
    reviews: 456,
    features: ["Keyword Research", "Link Building", "Local SEO", "Analytics"],
    installed: false
  },
  {
    id: "hike-seo",
    name: "Hike SEO",
    description: "Guided SEO platform tailored for small businesses",
    category: "SEO",
    icon: TrendingDown,
    price: "$49/mo",
    rating: 4.6,
    reviews: 789,
    features: ["SEO Audits", "Action Plans", "Rank Tracking", "Competitor Analysis"],
    installed: false
  },
  {
    id: "marketgoo",
    name: "marketgoo",
    description: "DIY SEO software that's simple for local businesses to use",
    category: "SEO",
    icon: Target,
    price: "$29/mo",
    rating: 4.5,
    reviews: 654,
    features: ["SEO Audits", "Simple Interface", "Task Lists", "Progress Tracking"],
    installed: false
  },
  {
    id: "search-atlas",
    name: "Search Atlas",
    description: "AI-powered SEO suite for research, content, and optimization",
    category: "SEO",
    icon: Database,
    price: "$99/mo",
    rating: 4.7,
    reviews: 432,
    features: ["AI Research", "Content Optimization", "Keyword Tracking", "Backlink Analysis"],
    installed: false
  },
  
  // Advertising
  {
    id: "advertising-intelligence",
    name: "Advertising Intelligence",
    description: "Unified ad reporting to see performance across Google and Meta in one place",
    category: "Advertising",
    icon: BarChart3,
    price: "Included",
    rating: 4.8,
    reviews: 987,
    features: ["Cross-platform Analytics", "ROI Tracking", "Performance Insights", "Budget Monitoring"],
    popular: true,
    installed: false
  },
  {
    id: "matchcraft",
    name: "MatchCraft",
    description: "Campaign management technology to scale paid ads efficiently",
    category: "Advertising",
    icon: Target,
    price: "$199/mo",
    rating: 4.7,
    reviews: 543,
    features: ["Campaign Automation", "Multi-platform", "Performance Tracking", "Budget Control"],
    installed: false
  },
  {
    id: "digital-advertising-service",
    name: "Digital Advertising (Service)",
    description: "Experts plan and run multi-channel ad campaigns for measurable results",
    category: "Services",
    icon: Megaphone,
    price: "$799/mo",
    rating: 4.8,
    reviews: 234,
    features: ["Campaign Strategy", "Ad Creative", "A/B Testing", "Monthly Reporting"],
    installed: false
  },
  {
    id: "adcellerant",
    name: "AdCellerant",
    description: "Managed programmatic and paid media execution for agencies",
    category: "Advertising",
    icon: TrendingUp,
    price: "$299/mo",
    rating: 4.7,
    reviews: 321,
    features: ["Programmatic Ads", "Display Campaigns", "Retargeting", "Performance Tracking"],
    installed: false
  },
  {
    id: "google-ads-robot",
    name: "Google Ads Robot",
    description: "AI-managed Google Search ads for smaller daily budgets",
    category: "Advertising",
    icon: Bot,
    price: "$99/mo",
    rating: 4.6,
    reviews: 456,
    features: ["AI Optimization", "Budget Management", "Keyword Targeting", "Automated Bidding"],
    installed: false
  },
  {
    id: "white-label-ppc-service",
    name: "White-label PPC Services",
    description: "Certified pros manage Google, Facebook, Instagram, and YouTube ads",
    category: "Services",
    icon: Target,
    price: "$599/mo",
    rating: 4.8,
    reviews: 287,
    features: ["Multi-platform Ads", "Campaign Management", "Creative Design", "Reporting"],
    installed: false
  },
  
  // Website & Hosting
  {
    id: "wordpress-hosting",
    name: "WordPress Hosting (Website Pro)",
    description: "Fast, secure WordPress hosting on Google Cloud with management tools",
    category: "Website",
    icon: Cloud,
    price: "$29/mo",
    rating: 4.8,
    reviews: 1432,
    features: ["Google Cloud", "SSL Certificate", "Daily Backups", "99.9% Uptime"],
    popular: true,
    installed: false
  },
  {
    id: "website-pro",
    name: "Website Pro",
    description: "Managed WordPress hosting and site tools for agencies and SMBs",
    category: "Website",
    icon: MonitorSmartphone,
    price: "$49/mo",
    rating: 4.7,
    reviews: 876,
    features: ["Website Builder", "SEO Tools", "Mobile Responsive", "E-commerce Ready"],
    installed: false
  },
  {
    id: "website-services",
    name: "Website Services (Service)",
    description: "Fast, optimized websites designed and built for your clients",
    category: "Services",
    icon: Code,
    price: "$999/mo",
    rating: 4.9,
    reviews: 432,
    features: ["Custom Design", "SEO Optimized", "Mobile Responsive", "Content Creation"],
    installed: false
  },
  {
    id: "white-label-web-design",
    name: "White-label Web Design Services",
    description: "Professional websites fulfilled under your brand",
    category: "Services",
    icon: Palette,
    price: "$1,299/mo",
    rating: 4.8,
    reviews: 234,
    features: ["Custom Design", "Brand Alignment", "SEO Ready", "Client Portal"],
    installed: false
  },
  {
    id: "website-woocommerce",
    name: "Website & WooCommerce Store (Service)",
    description: "Ongoing service and maintenance for a WordPress e-commerce site",
    category: "Website",
    icon: ShoppingCart,
    price: "$199/mo",
    rating: 4.7,
    reviews: 345,
    features: ["E-commerce Setup", "Product Management", "Payment Integration", "Maintenance"],
    installed: false
  },
  {
    id: "unbounce",
    name: "Unbounce",
    description: "AI-powered landing page builder and testing platform",
    category: "Website",
    icon: LayoutDashboard,
    price: "$90/mo",
    rating: 4.6,
    reviews: 567,
    features: ["Landing Pages", "A/B Testing", "Templates", "Conversion Optimization"],
    installed: false
  },
  
  // Email & SMS Marketing
  {
    id: "campaigns-pro",
    name: "Email & SMS Marketing (Campaigns Pro)",
    description: "Automates personalized email and text campaigns to drive conversions",
    category: "Marketing",
    icon: Send,
    price: "Included",
    rating: 4.8,
    reviews: 1234,
    features: ["Email Campaigns", "SMS Marketing", "Automation", "Analytics"],
    popular: true,
    installed: false
  },
  {
    id: "activecampaign",
    name: "ActiveCampaign",
    description: "Marketing automation and CRM to nurture and retain customers",
    category: "Marketing",
    icon: Workflow,
    price: "$29/mo",
    rating: 4.7,
    reviews: 2345,
    features: ["Marketing Automation", "CRM", "Email Marketing", "Sales Automation"],
    installed: false
  },
  
  // Scheduling
  {
    id: "calendarhero",
    name: "CalendarHero",
    description: "Smart scheduling that books meetings and reduces back-and-forth",
    category: "Productivity",
    icon: Calendar,
    price: "$8/mo",
    rating: 4.7,
    reviews: 876,
    features: ["Smart Scheduling", "Calendar Sync", "Time Zone Detection", "Meeting Links"],
    installed: false
  },
  
  // Business Apps
  {
    id: "business-app-pro",
    name: "Business App Pro",
    description: "Client-facing portal with AI tools for local business growth",
    category: "Business Apps",
    icon: Smartphone,
    price: "$99/mo",
    rating: 4.8,
    reviews: 654,
    features: ["Client Portal", "AI Tools", "Mobile App", "White-label"],
    installed: false
  },
  
  // Payments & Invoicing
  {
    id: "payments",
    name: "Payments",
    description: "Invoicing and secure online payments integrated with client accounts",
    category: "Finance",
    icon: CreditCard,
    price: "2.9% + $0.30",
    rating: 4.7,
    reviews: 987,
    features: ["Online Payments", "Invoicing", "Recurring Billing", "Payment Links"],
    installed: false
  },
  
  // Reporting & Analytics
  {
    id: "reporting",
    name: "Reporting",
    description: "Proof-of-performance and roll-up analytics to show ROI",
    category: "Analytics",
    icon: BarChart3,
    price: "Included",
    rating: 4.8,
    reviews: 1234,
    features: ["Custom Reports", "ROI Tracking", "Client Reports", "Data Visualization"],
    popular: true,
    installed: true
  },
  {
    id: "snapshot-report",
    name: "Snapshot Report",
    description: "Automated prospect audit that identifies gaps and starts sales conversations",
    category: "Analytics",
    icon: Eye,
    price: "Included",
    rating: 4.9,
    reviews: 876,
    features: ["Automated Audits", "Gap Analysis", "Lead Generation", "Custom Branding"],
    installed: false
  },
  
  // Portals
  {
    id: "client-portal",
    name: "Client-facing Portal",
    description: "A branded hub where clients access apps, reports, and billing",
    category: "Business Apps",
    icon: Building2,
    price: "Included",
    rating: 4.8,
    reviews: 1543,
    features: ["Branded Portal", "App Access", "Billing", "Reports"],
    popular: true,
    installed: false
  },
  {
    id: "multi-location-portal",
    name: "Multi-location Portal",
    description: "Monitor reviews, listings, and performance across many locations centrally",
    category: "Business Apps",
    icon: Layers,
    price: "$199/mo",
    rating: 4.7,
    reviews: 432,
    features: ["Multi-location", "Centralized Dashboard", "Performance Tracking", "Reporting"],
    installed: false
  },
  {
    id: "white-label-portal",
    name: "White-label Portal",
    description: "Partner platform to deliver services under your own brand",
    category: "Business Apps",
    icon: Store,
    price: "Custom",
    rating: 4.9,
    reviews: 234,
    features: ["Full White-label", "Partner Dashboard", "Client Management", "Billing"],
    installed: false
  },
  
  // Marketplace & Integrations
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Add third-party apps and services with one login and one bill",
    category: "Platform",
    icon: ShoppingCart,
    price: "Included",
    rating: 4.8,
    reviews: 987,
    features: ["250+ Apps", "Single Login", "Unified Billing", "Easy Integration"],
    popular: true,
    installed: false
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "Connect external tools and enable data flow across your stack",
    category: "Platform",
    icon: Link,
    price: "Included",
    rating: 4.7,
    reviews: 765,
    features: ["API Access", "Webhooks", "Zapier Integration", "Custom Integrations"],
    installed: true
  },
  
  // Automation & Workflow
  {
    id: "automations",
    name: "Automations",
    description: "No-code workflows that trigger tasks, messages, and provisioning",
    category: "Productivity",
    icon: Workflow,
    price: "Included",
    rating: 4.8,
    reviews: 1234,
    features: ["No-code Builder", "Trigger Actions", "Multi-step Workflows", "Integrations"],
    popular: true,
    installed: false
  },
  {
    id: "project-management",
    name: "Project Management",
    description: "Plan, track, and collaborate on fulfillment with clients in one workspace",
    category: "Productivity",
    icon: Boxes,
    price: "Included",
    rating: 4.7,
    reviews: 654,
    features: ["Task Management", "Client Collaboration", "Time Tracking", "File Sharing"],
    installed: false
  },
  
  // E-commerce Tools
  {
    id: "ochatbot",
    name: "Ochatbot | eCommerce AI Chatbot",
    description: "Conversational shopping assistant to increase online sales",
    category: "E-commerce",
    icon: Bot,
    price: "$39/mo",
    rating: 4.6,
    reviews: 321,
    features: ["Product Recommendations", "Cart Recovery", "24/7 Support", "Multi-language"],
    installed: false
  },
  
  // Accessibility & Compliance
  {
    id: "audioeye",
    name: "AudioEye Digital Accessibility",
    description: "ADA/WCAG accessibility monitoring and remediation",
    category: "Compliance",
    icon: ShieldCheck,
    price: "$49/mo",
    rating: 4.8,
    reviews: 432,
    features: ["Accessibility Audits", "Auto-remediation", "ADA Compliance", "Monitoring"],
    installed: false
  },
  
  // Domain & Hosting
  {
    id: "godaddy-domains",
    name: "GoDaddy Domains",
    description: "Domain registration and web presence tools clients recognize",
    category: "Website",
    icon: Globe,
    price: "$11.99/yr",
    rating: 4.6,
    reviews: 3456,
    features: ["Domain Registration", "DNS Management", "Email Forwarding", "Privacy Protection"],
    installed: false
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    description: "Business email, docs, and collaboration suite",
    category: "Productivity",
    icon: Mail,
    price: "$6/user/mo",
    rating: 4.8,
    reviews: 8765,
    features: ["Gmail", "Google Drive", "Google Docs", "Google Meet"],
    popular: true,
    installed: false
  },
  
  // Insurance
  {
    id: "simplyinsured",
    name: "SimplyInsured",
    description: "Online comparison and enrollment for small-business health insurance",
    category: "HR & Benefits",
    icon: Shield,
    price: "Free",
    rating: 4.7,
    reviews: 234,
    features: ["Plan Comparison", "Online Enrollment", "Compliance Support", "Employee Management"],
    installed: false
  },
  
  // Community & Resources
  {
    id: "community",
    name: "Community",
    description: "Partner community to share ideas and get answers",
    category: "Support",
    icon: Users,
    price: "Free",
    rating: 4.8,
    reviews: 1543,
    features: ["Discussion Forums", "Best Practices", "Networking", "Events"],
    installed: false
  },
  {
    id: "help-center",
    name: "Help Center",
    description: "Central documentation and support resources for partners",
    category: "Support",
    icon: HelpCircle,
    price: "Free",
    rating: 4.7,
    reviews: 2345,
    features: ["Documentation", "Video Tutorials", "FAQs", "Support Tickets"],
    installed: false
  },
  {
    id: "roadmap",
    name: "Roadmap",
    description: "Public product ideas and release tracking for the platform",
    category: "Support",
    icon: GitBranch,
    price: "Free",
    rating: 4.6,
    reviews: 876,
    features: ["Feature Requests", "Upcoming Releases", "Voting", "Transparency"],
    installed: false
  },
  {
    id: "case-studies",
    name: "Case Studies",
    description: "Real-world examples of partners growing their business",
    category: "Support",
    icon: BookOpen,
    price: "Free",
    rating: 4.8,
    reviews: 543,
    features: ["Success Stories", "Best Practices", "Industry Insights", "ROI Examples"],
    installed: false
  },
  {
    id: "affiliate-program",
    name: "Affiliate Program",
    description: "Referral program to earn by promoting our platform",
    category: "Platform",
    icon: UserCheck,
    price: "Free to join",
    rating: 4.7,
    reviews: 432,
    features: ["Commission Earnings", "Marketing Materials", "Tracking Dashboard", "Support"],
    installed: false
  },
  
  // Learning Resources
  {
    id: "start-digital-agency",
    name: "Start a Digital Agency (Guide)",
    description: "Step-by-step resources to launch and scale a new agency",
    category: "Education",
    icon: GraduationCap,
    price: "Free",
    rating: 4.9,
    reviews: 765,
    features: ["Launch Guide", "Business Planning", "Marketing Strategies", "Templates"],
    installed: false
  },
  {
    id: "grow-agency",
    name: "Grow Your Agency (Guide)",
    description: "Playbooks and tools to expand services and revenue",
    category: "Education",
    icon: TrendingUp,
    price: "Free",
    rating: 4.8,
    reviews: 654,
    features: ["Growth Strategies", "Service Expansion", "Sales Playbooks", "Case Studies"],
    installed: false
  },
  {
    id: "make-money-ai",
    name: "Make Money with AI (Guide)",
    description: "Resources to package and sell AI-powered offerings",
    category: "Education",
    icon: Lightbulb,
    price: "Free",
    rating: 4.9,
    reviews: 987,
    features: ["AI Products", "Pricing Strategies", "Marketing Materials", "Success Stories"],
    installed: false
  },
  {
    id: "vendor-center",
    name: "Vendor Center",
    description: "Tools for ISVs to distribute software to the reseller network",
    category: "Platform",
    icon: Store,
    price: "Free",
    rating: 4.7,
    reviews: 234,
    features: ["App Marketplace", "Partner Network", "Distribution Tools", "Revenue Share"],
    installed: false
  }
];

const categories = [
  { name: "All Tools", count: tools.length },
  { name: "AI Tools", count: tools.filter(t => t.category === "AI Tools").length },
  { name: "Sales & CRM", count: tools.filter(t => t.category === "Sales & CRM").length },
  { name: "Marketing", count: tools.filter(t => t.category === "Marketing").length },
  { name: "SEO", count: tools.filter(t => t.category === "SEO").length },
  { name: "Advertising", count: tools.filter(t => t.category === "Advertising").length },
  { name: "Website", count: tools.filter(t => t.category === "Website").length },
  { name: "Services", count: tools.filter(t => t.category === "Services").length },
  { name: "Platform", count: tools.filter(t => t.category === "Platform").length }
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