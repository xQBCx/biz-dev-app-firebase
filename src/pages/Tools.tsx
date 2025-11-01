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
  Headphones,
  MapPin,
  LineChart,
  Activity,
  Radio,
  Video,
  Image,
  FileImage,
  Play,
  Layout,
  Truck,
  Repeat,
  Camera,
  Film,
  Pencil,
  AlertCircle,
  Bell,
  Clock,
  UserPlus,
  Receipt,
  Wallet,
  BanknoteIcon,
  Calculator,
  PieChart,
  Server,
  KeyRound,
  Fingerprint,
  RefreshCw,
  Cpu,
  HardDrive,
  MessageCircle,
  Video as VideoIcon,
  Mic
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
  },

  // Local Marketing & SEO
  {
    id: "brightlocal",
    name: "BrightLocal",
    description: "Local SEO auditing and citation tracking for multi-location businesses",
    category: "Local SEO",
    icon: MapPin,
    price: "$49/mo",
    rating: 4.7,
    reviews: 892,
    features: ["Citation Tracking", "Rank Monitoring", "Review Management", "Audit Tools"],
    installed: false
  },
  {
    id: "semrush",
    name: "SEMrush",
    description: "Keyword, backlink, and competitor analysis for advanced marketers",
    category: "Local SEO",
    icon: Search,
    price: "$129/mo",
    rating: 4.9,
    reviews: 3245,
    features: ["Keyword Research", "Competitor Analysis", "Backlink Tracking", "Site Audit"],
    popular: true,
    installed: false
  },
  {
    id: "moz-local",
    name: "Moz Local",
    description: "Listing and review management built around Moz's data API",
    category: "Local SEO",
    icon: Map,
    price: "$14/mo",
    rating: 4.6,
    reviews: 1567,
    features: ["Listing Management", "Duplicate Suppression", "Review Monitoring", "Insights"],
    installed: false
  },
  {
    id: "yext-listings",
    name: "Yext Listings",
    description: "Automatic directory synchronization to hundreds of sources",
    category: "Local SEO",
    icon: Network,
    price: "Custom",
    rating: 4.5,
    reviews: 987,
    features: ["Directory Sync", "Multi-Location", "Analytics", "API Access"],
    installed: false
  },
  {
    id: "uberall-corex",
    name: "Uberall CoreX",
    description: "Enterprise-grade presence management and local reviews",
    category: "Local SEO",
    icon: Building2,
    price: "Contact Sales",
    rating: 4.7,
    reviews: 543,
    features: ["Enterprise Scale", "Review Management", "Local Pages", "Analytics"],
    installed: false
  },
  {
    id: "synup",
    name: "Synup",
    description: "Location data and review aggregator for franchises",
    category: "Local SEO",
    icon: MapPin,
    price: "$99/mo",
    rating: 4.6,
    reviews: 432,
    features: ["Multi-Location", "Review Aggregation", "Listing Sync", "Reporting"],
    installed: false
  },
  {
    id: "georanker",
    name: "GeoRanker",
    description: "Real-time local rank-tracking via proxy networks",
    category: "Local SEO",
    icon: Activity,
    price: "$49/mo",
    rating: 4.5,
    reviews: 321,
    features: ["Real-Time Tracking", "Geo-Grid Analysis", "Competitor Tracking", "Reports"],
    installed: false
  },
  {
    id: "whitespark-citation",
    name: "Whitespark Citation Builder",
    description: "Manual citation cleanup and building",
    category: "Local SEO",
    icon: Wrench,
    price: "$25/citation",
    rating: 4.8,
    reviews: 765,
    features: ["Manual Service", "Citation Cleanup", "Niche Directories", "Expert Support"],
    installed: false
  },
  {
    id: "brightedge",
    name: "BrightEdge",
    description: "AI-driven enterprise SEO content insights",
    category: "Local SEO",
    icon: Lightbulb,
    price: "Contact Sales",
    rating: 4.6,
    reviews: 456,
    features: ["Enterprise AI", "Content Insights", "Competitor Research", "Intent Analysis"],
    installed: false
  },
  {
    id: "surfer-seo",
    name: "Surfer SEO",
    description: "On-page content optimization powered by data science",
    category: "Local SEO",
    icon: LineChart,
    price: "$89/mo",
    rating: 4.8,
    reviews: 1234,
    features: ["Content Editor", "SERP Analyzer", "Keyword Research", "Audit"],
    popular: true,
    installed: false
  },
  {
    id: "rank-math-pro",
    name: "Rank Math Pro",
    description: "Advanced WordPress SEO plugin integration",
    category: "Local SEO",
    icon: Code,
    price: "$59/yr",
    rating: 4.9,
    reviews: 2345,
    features: ["WordPress Plugin", "Schema Markup", "SEO Analysis", "Local SEO"],
    installed: false
  },
  {
    id: "sitebulb",
    name: "Sitebulb",
    description: "Technical SEO auditing crawler for websites",
    category: "Local SEO",
    icon: Search,
    price: "$35/mo",
    rating: 4.7,
    reviews: 654,
    features: ["Site Crawling", "Technical Audits", "Visualizations", "Reports"],
    installed: false
  },
  {
    id: "seoreseller",
    name: "SEOReseller Fulfillment",
    description: "Outsourced white-label SEO execution",
    category: "Local SEO",
    icon: Users,
    price: "Custom",
    rating: 4.5,
    reviews: 432,
    features: ["White Label", "Fulfillment", "Monthly Reports", "Expert Team"],
    installed: false
  },
  {
    id: "local-viking",
    name: "Local Viking",
    description: "Google Business Profile post scheduler and tracking",
    category: "Local SEO",
    icon: Calendar,
    price: "$20/mo",
    rating: 4.6,
    reviews: 543,
    features: ["GBP Posting", "Scheduling", "Analytics", "Multi-Location"],
    installed: false
  },
  {
    id: "localfalcon",
    name: "LocalFalcon",
    description: "Geo-grid visibility map analytics for GBP rankings",
    category: "Local SEO",
    icon: Map,
    price: "$29/mo",
    rating: 4.8,
    reviews: 678,
    features: ["Heat Maps", "Grid Tracking", "Competitor Analysis", "Reports"],
    installed: false
  },

  // Advertising & Lead Gen
  {
    id: "meta-ads-lite",
    name: "Meta Ads Manager Lite",
    description: "Simplified interface for small-budget Facebook ads",
    category: "Advertising",
    icon: Target,
    price: "Free + Ad Spend",
    rating: 4.5,
    reviews: 1234,
    features: ["Simplified Setup", "Budget Management", "Performance Tracking", "Templates"],
    installed: false
  },
  {
    id: "google-lsa",
    name: "Google Local Services Ads Setup",
    description: "Managed onboarding and optimization",
    category: "Advertising",
    icon: MapPin,
    price: "$299 Setup",
    rating: 4.7,
    reviews: 765,
    features: ["Setup Service", "Badge Verification", "Optimization", "Support"],
    installed: false
  },
  {
    id: "youtube-ads",
    name: "YouTube Ads Builder",
    description: "Template-based video-ad generator",
    category: "Advertising",
    icon: Video,
    price: "Free + Ad Spend",
    rating: 4.6,
    reviews: 543,
    features: ["Video Templates", "Targeting", "Analytics", "Campaign Management"],
    installed: false
  },
  {
    id: "tiktok-ads-pro",
    name: "TikTok Ads Pro",
    description: "Self-serve short-video campaign tool",
    category: "Advertising",
    icon: Film,
    price: "Free + Ad Spend",
    rating: 4.8,
    reviews: 987,
    features: ["Creative Studio", "Targeting", "Analytics", "A/B Testing"],
    popular: true,
    installed: false
  },
  {
    id: "linkedin-ads",
    name: "LinkedIn Ads Manager",
    description: "B2B lead-gen with LinkedIn's API integration",
    category: "Advertising",
    icon: Users,
    price: "Free + Ad Spend",
    rating: 4.7,
    reviews: 1456,
    features: ["B2B Targeting", "Lead Gen Forms", "Account-Based", "Analytics"],
    installed: false
  },
  {
    id: "adroll",
    name: "AdRoll Retargeting",
    description: "Multi-channel display and email retargeting",
    category: "Advertising",
    icon: Repeat,
    price: "$36/mo + Ad Spend",
    rating: 4.6,
    reviews: 876,
    features: ["Retargeting", "Multi-Channel", "Email Retargeting", "Analytics"],
    installed: false
  },
  {
    id: "programmatic-display",
    name: "Programmatic Display Pro",
    description: "DSP access for agencies without minimum spend",
    category: "Advertising",
    icon: LayoutDashboard,
    price: "Custom",
    rating: 4.5,
    reviews: 432,
    features: ["DSP Access", "No Minimums", "Targeting", "Reporting"],
    installed: false
  },
  {
    id: "ctv-ott",
    name: "CTV/OTT Advertising",
    description: "Stream-TV ad placement with local targeting",
    category: "Advertising",
    icon: MonitorSmartphone,
    price: "Custom",
    rating: 4.7,
    reviews: 543,
    features: ["Streaming TV", "Local Targeting", "Premium Inventory", "Analytics"],
    installed: false
  },
  {
    id: "callrail",
    name: "CallRail",
    description: "Call-tracking and dynamic number insertion",
    category: "Advertising",
    icon: Phone,
    price: "$45/mo",
    rating: 4.8,
    reviews: 1987,
    features: ["Call Tracking", "Dynamic Numbers", "Recording", "Attribution"],
    popular: true,
    installed: false
  },
  {
    id: "whatconverts",
    name: "WhatConverts",
    description: "Lead tracking that attributes every form and call",
    category: "Advertising",
    icon: Target,
    price: "$30/mo",
    rating: 4.7,
    reviews: 765,
    features: ["Multi-Channel", "Attribution", "Call Recording", "Reporting"],
    installed: false
  },
  {
    id: "optinmonster",
    name: "OptinMonster",
    description: "Pop-ups and on-site conversion widgets",
    category: "Advertising",
    icon: Zap,
    price: "$9/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Pop-ups", "Exit Intent", "A/B Testing", "Templates"],
    installed: false
  },
  {
    id: "sharpspring-ads",
    name: "SharpSpring Ads",
    description: "Integrated ad automation inside CRM",
    category: "Advertising",
    icon: Workflow,
    price: "$449/mo",
    rating: 4.5,
    reviews: 432,
    features: ["CRM Integration", "Automation", "Multi-Channel", "Analytics"],
    installed: false
  },
  {
    id: "constant-contact-ads",
    name: "Constant Contact Ads",
    description: "Drag-and-drop ad builder linked to email lists",
    category: "Advertising",
    icon: Mail,
    price: "$20/mo + Ad Spend",
    rating: 4.4,
    reviews: 543,
    features: ["Email Integration", "Drag-and-Drop", "Retargeting", "Tracking"],
    installed: false
  },
  {
    id: "hubspot-ads",
    name: "HubSpot Ads Bridge",
    description: "Sync CRM audiences to Google and Meta ads",
    category: "Advertising",
    icon: Link,
    price: "Included w/ HubSpot",
    rating: 4.8,
    reviews: 1234,
    features: ["CRM Sync", "Audience Sync", "Attribution", "ROI Tracking"],
    installed: false
  },
  {
    id: "revealbot",
    name: "Revealbot",
    description: "Automated ad-optimization rules across platforms",
    category: "Advertising",
    icon: Bot,
    price: "$49/mo",
    rating: 4.7,
    reviews: 876,
    features: ["Automation Rules", "Multi-Platform", "Slack Alerts", "Reporting"],
    installed: false
  },

  // Social & Content Marketing
  {
    id: "later",
    name: "Later",
    description: "Instagram and TikTok scheduler with link-in-bio pages",
    category: "Social Media",
    icon: Calendar,
    price: "$25/mo",
    rating: 4.7,
    reviews: 2345,
    features: ["Visual Planner", "Link in Bio", "Analytics", "Scheduling"],
    popular: true,
    installed: false
  },
  {
    id: "buffer",
    name: "Buffer Business",
    description: "Social posting and analytics for teams",
    category: "Social Media",
    icon: Share2,
    price: "$6/mo/channel",
    rating: 4.6,
    reviews: 3456,
    features: ["Multi-Platform", "Analytics", "Team Collaboration", "Scheduling"],
    installed: false
  },
  {
    id: "hootsuite",
    name: "Hootsuite",
    description: "Enterprise social media management suite",
    category: "Social Media",
    icon: Share2,
    price: "$99/mo",
    rating: 4.5,
    reviews: 4567,
    features: ["Enterprise Features", "Team Management", "Analytics", "Streams"],
    installed: false
  },
  {
    id: "planoly",
    name: "Planoly",
    description: "Visual planner for Instagram and Pinterest feeds",
    category: "Social Media",
    icon: LayoutDashboard,
    price: "$15/mo",
    rating: 4.7,
    reviews: 1876,
    features: ["Visual Grid", "Auto-Post", "Analytics", "Link in Bio"],
    installed: false
  },
  {
    id: "canva-pro",
    name: "Canva Pro",
    description: "Graphic-design tool for marketing content",
    category: "Content Creation",
    icon: Palette,
    price: "$12.99/mo",
    rating: 4.9,
    reviews: 9876,
    features: ["Templates", "Brand Kit", "Magic Resize", "Collaboration"],
    popular: true,
    installed: false
  },
  {
    id: "vistacreate",
    name: "VistaCreate",
    description: "White-label design templates library",
    category: "Content Creation",
    icon: Image,
    price: "$10/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["Templates", "Animations", "Brand Kit", "Resize"],
    installed: false
  },
  {
    id: "pexels",
    name: "Pexels Stock",
    description: "Royalty-free photos integrated into post creation",
    category: "Content Creation",
    icon: Camera,
    price: "Free",
    rating: 4.8,
    reviews: 5432,
    features: ["Free Photos", "High Quality", "No Attribution", "API Access"],
    installed: false
  },
  {
    id: "promo-video",
    name: "Promo.com Video Maker",
    description: "Marketing-video templates with music library",
    category: "Content Creation",
    icon: Play,
    price: "$39/mo",
    rating: 4.5,
    reviews: 876,
    features: ["Video Templates", "Music Library", "Text Overlay", "Export Options"],
    installed: false
  },
  {
    id: "loomly",
    name: "Loomly",
    description: "Multi-client social calendar collaboration platform",
    category: "Social Media",
    icon: Calendar,
    price: "$32/mo",
    rating: 4.7,
    reviews: 987,
    features: ["Content Calendar", "Approval Workflow", "Post Ideas", "Analytics"],
    installed: false
  },
  {
    id: "sprout-social",
    name: "Sprout Social Integration",
    description: "Deep reporting for enterprise accounts",
    category: "Social Media",
    icon: BarChart3,
    price: "$249/mo",
    rating: 4.6,
    reviews: 1456,
    features: ["Enterprise Reporting", "Social CRM", "Team Management", "Analytics"],
    installed: false
  },
  {
    id: "socialpilot",
    name: "SocialPilot",
    description: "Budget-friendly scheduling tool for agencies",
    category: "Social Media",
    icon: Calendar,
    price: "$30/mo",
    rating: 4.5,
    reviews: 765,
    features: ["Bulk Scheduling", "Client Management", "White Label", "Analytics"],
    installed: false
  },
  {
    id: "sendible",
    name: "Sendible",
    description: "Social inbox and approval workflow system",
    category: "Social Media",
    icon: MessageSquare,
    price: "$29/mo",
    rating: 4.6,
    reviews: 654,
    features: ["Unified Inbox", "Approval Workflows", "Scheduling", "Reports"],
    installed: false
  },
  {
    id: "feedly-ai",
    name: "Feedly AI",
    description: "Trend-monitoring content discovery assistant",
    category: "Content Creation",
    icon: Radio,
    price: "$16/mo",
    rating: 4.7,
    reviews: 543,
    features: ["Content Discovery", "AI Filtering", "Trending Topics", "RSS Feeds"],
    installed: false
  },
  {
    id: "quuu",
    name: "Quuu Curated Content",
    description: "Auto-curation feed for social posting",
    category: "Content Creation",
    icon: RefreshCw,
    price: "$25/mo",
    rating: 4.4,
    reviews: 432,
    features: ["Content Curation", "Auto-Posting", "Hand-Picked", "Categories"],
    installed: false
  },
  {
    id: "missinglettr",
    name: "Missinglettr",
    description: "Automates blog-to-social campaigns over a year",
    category: "Social Media",
    icon: Workflow,
    price: "$19/mo",
    rating: 4.5,
    reviews: 321,
    features: ["Blog Automation", "Drip Campaign", "Social Posting", "Analytics"],
    installed: false
  },

  // Websites & E-Commerce
  {
    id: "shopify",
    name: "Shopify",
    description: "Complete e-commerce store builder",
    category: "E-Commerce",
    icon: ShoppingCart,
    price: "$39/mo",
    rating: 4.8,
    reviews: 12345,
    features: ["Online Store", "Payments", "Inventory", "Marketing Tools"],
    popular: true,
    installed: false
  },
  {
    id: "wix-studio",
    name: "Wix Studio",
    description: "Drag-and-drop web creation for SMBs",
    category: "Website",
    icon: Layout,
    price: "$27/mo",
    rating: 4.6,
    reviews: 8765,
    features: ["Drag & Drop", "Templates", "Mobile Responsive", "SEO Tools"],
    installed: false
  },
  {
    id: "squarespace",
    name: "Squarespace",
    description: "All-in-one site and portfolio builder",
    category: "Website",
    icon: Layout,
    price: "$16/mo",
    rating: 4.7,
    reviews: 6543,
    features: ["Beautiful Templates", "E-commerce", "Analytics", "Blogging"],
    popular: true,
    installed: false
  },
  {
    id: "bigcommerce",
    name: "BigCommerce",
    description: "Scalable multi-channel e-commerce solution",
    category: "E-Commerce",
    icon: Store,
    price: "$39/mo",
    rating: 4.6,
    reviews: 3456,
    features: ["Multi-Channel", "No Transaction Fees", "B2B Features", "APIs"],
    installed: false
  },
  {
    id: "weebly",
    name: "Weebly",
    description: "Entry-level site builder with Square integration",
    category: "Website",
    icon: Layout,
    price: "$10/mo",
    rating: 4.5,
    reviews: 5432,
    features: ["Simple Builder", "Square Integration", "E-commerce", "Mobile App"],
    installed: false
  },
  {
    id: "woocommerce-setup",
    name: "WooCommerce Setup Service",
    description: "White-label store configuration",
    category: "E-Commerce",
    icon: Wrench,
    price: "$299 Setup",
    rating: 4.7,
    reviews: 1234,
    features: ["WordPress Plugin", "Setup Service", "Payment Integration", "Shipping"],
    installed: false
  },
  {
    id: "ecwid",
    name: "Ecwid by Lightspeed",
    description: "Add-on storefront for existing websites",
    category: "E-Commerce",
    icon: ShoppingCart,
    price: "Free - $99/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Easy Integration", "Multi-Platform", "Mobile POS", "Inventory"],
    installed: false
  },
  {
    id: "elementor-pro",
    name: "Elementor Pro",
    description: "WordPress page builder with templates",
    category: "Website",
    icon: Code,
    price: "$59/yr",
    rating: 4.8,
    reviews: 7654,
    features: ["Visual Builder", "WooCommerce", "Templates", "Theme Builder"],
    installed: false
  },
  {
    id: "divi-builder",
    name: "Divi Builder",
    description: "Visual design framework for agencies",
    category: "Website",
    icon: Layers,
    price: "$89/yr",
    rating: 4.7,
    reviews: 5432,
    features: ["Visual Builder", "Templates", "Theme", "Split Testing"],
    installed: false
  },
  {
    id: "siteground",
    name: "SiteGround Hosting",
    description: "Managed hosting with performance caching",
    category: "Website",
    icon: Server,
    price: "$3.99/mo",
    rating: 4.8,
    reviews: 4321,
    features: ["Fast Hosting", "Free SSL", "Daily Backups", "Support"],
    installed: false
  },
  {
    id: "cloudflare-cdn",
    name: "Cloudflare CDN",
    description: "Global content delivery and security layer",
    category: "Website",
    icon: Cloud,
    price: "Free - $20/mo",
    rating: 4.9,
    reviews: 8765,
    features: ["CDN", "DDoS Protection", "SSL", "Performance"],
    popular: true,
    installed: false
  },
  {
    id: "google-domains",
    name: "Google Domains",
    description: "Domain registration and DNS management",
    category: "Website",
    icon: Globe,
    price: "$12/yr",
    rating: 4.6,
    reviews: 3456,
    features: ["Domain Registration", "DNS Management", "Email Forwarding", "Privacy"],
    installed: false
  },
  {
    id: "namecheap-ssl",
    name: "Namecheap SSL",
    description: "Affordable SSL certificates",
    category: "Website",
    icon: Lock,
    price: "$8/yr",
    rating: 4.7,
    reviews: 2345,
    features: ["SSL Certificates", "Wildcard SSL", "Support", "Easy Install"],
    installed: false
  },
  {
    id: "paypal-commerce",
    name: "PayPal Commerce Integration",
    description: "Payment gateway setup",
    category: "E-Commerce",
    icon: CreditCard,
    price: "2.9% + $0.30",
    rating: 4.5,
    reviews: 9876,
    features: ["Easy Integration", "Buyer Protection", "Multiple Currencies", "Recurring"],
    installed: false
  },
  {
    id: "stripe-payments",
    name: "Stripe Payments",
    description: "Credit card processing for online stores",
    category: "E-Commerce",
    icon: CreditCard,
    price: "2.9% + $0.30",
    rating: 4.8,
    reviews: 11234,
    features: ["Developer-Friendly", "Subscriptions", "Global", "Security"],
    popular: true,
    installed: false
  },
  {
    id: "square-pos",
    name: "Square POS Online",
    description: "Syncs in-person and e-commerce sales",
    category: "E-Commerce",
    icon: CreditCard,
    price: "2.6% + $0.10",
    rating: 4.7,
    reviews: 6543,
    features: ["POS System", "Online Store", "Inventory Sync", "Analytics"],
    installed: false
  },
  {
    id: "printful",
    name: "Printful",
    description: "On-demand merch printing fulfillment",
    category: "E-Commerce",
    icon: Package,
    price: "Per Order",
    rating: 4.6,
    reviews: 3456,
    features: ["Print on Demand", "No Minimums", "Branding", "Integration"],
    installed: false
  },
  {
    id: "shipstation",
    name: "ShipStation",
    description: "Multi-carrier shipping automation",
    category: "E-Commerce",
    icon: Truck,
    price: "$9.99/mo",
    rating: 4.7,
    reviews: 5432,
    features: ["Multi-Carrier", "Automation", "Branded Tracking", "Analytics"],
    installed: false
  },
  {
    id: "yotpo",
    name: "Yotpo Reviews",
    description: "Collects and displays verified customer reviews",
    category: "E-Commerce",
    icon: Star,
    price: "Free - $79/mo",
    rating: 4.8,
    reviews: 2345,
    features: ["Review Collection", "UGC", "SEO", "Analytics"],
    installed: false
  },
  {
    id: "klaviyo",
    name: "Klaviyo",
    description: "E-commerce email and SMS automation",
    category: "E-Commerce",
    icon: Mail,
    price: "Free - $20/mo",
    rating: 4.8,
    reviews: 4567,
    features: ["Email Marketing", "SMS", "Segmentation", "Flows"],
    popular: true,
    installed: false
  },

  // Analytics & Reporting
  {
    id: "ga4-setup",
    name: "Google Analytics 4 Setup",
    description: "Tag installation and dashboard service",
    category: "Analytics",
    icon: BarChart3,
    price: "$99 Setup",
    rating: 4.7,
    reviews: 1876,
    features: ["GA4 Setup", "Tag Installation", "Custom Reports", "Training"],
    installed: false
  },
  {
    id: "databox",
    name: "Databox",
    description: "Pulls marketing KPIs into visual dashboards",
    category: "Analytics",
    icon: LayoutDashboard,
    price: "$72/mo",
    rating: 4.6,
    reviews: 987,
    features: ["Dashboard Builder", "100+ Integrations", "Mobile App", "Alerts"],
    installed: false
  },
  {
    id: "agencyanalytics",
    name: "AgencyAnalytics",
    description: "Automated client reporting suite",
    category: "Analytics",
    icon: FileText,
    price: "$12/mo/client",
    rating: 4.8,
    reviews: 1543,
    features: ["White Label", "Automated Reports", "80+ Integrations", "Client Portal"],
    popular: true,
    installed: false
  },
  {
    id: "supermetrics",
    name: "Supermetrics",
    description: "Data connector from ad platforms to spreadsheets",
    category: "Analytics",
    icon: Database,
    price: "$99/mo",
    rating: 4.7,
    reviews: 1234,
    features: ["Data Connector", "Google Sheets", "Data Studio", "BigQuery"],
    installed: false
  },
  {
    id: "looker-studio",
    name: "Looker Studio Templates",
    description: "Pre-built data studio dashboards",
    category: "Analytics",
    icon: BarChart3,
    price: "Free",
    rating: 4.6,
    reviews: 2345,
    features: ["Free Templates", "Customizable", "Google Integration", "Sharing"],
    installed: false
  },
  {
    id: "calltrackingmetrics",
    name: "CallTrackingMetrics",
    description: "Attribution for calls and conversions",
    category: "Analytics",
    icon: Phone,
    price: "$39/mo",
    rating: 4.7,
    reviews: 876,
    features: ["Call Tracking", "Form Tracking", "Attribution", "Recording"],
    installed: false
  },
  {
    id: "tapclicks",
    name: "TapClicks",
    description: "Enterprise marketing data warehouse and reporting",
    category: "Analytics",
    icon: Database,
    price: "$499/mo",
    rating: 4.5,
    reviews: 432,
    features: ["Data Warehouse", "White Label", "Order Management", "Reporting"],
    installed: false
  },
  {
    id: "whatagraph",
    name: "Whatagraph",
    description: "Multi-channel marketing reports for agencies",
    category: "Analytics",
    icon: FileText,
    price: "$223/mo",
    rating: 4.6,
    reviews: 654,
    features: ["Automated Reports", "White Label", "40+ Integrations", "Cross-Channel"],
    installed: false
  },
  {
    id: "klipfolio",
    name: "Klipfolio",
    description: "Customizable real-time dashboards",
    category: "Analytics",
    icon: Activity,
    price: "$90/mo",
    rating: 4.5,
    reviews: 543,
    features: ["Real-Time", "Custom Dashboards", "100+ Integrations", "Alerts"],
    installed: false
  },
  {
    id: "plecto",
    name: "Plecto",
    description: "Performance dashboards for sales and support teams",
    category: "Analytics",
    icon: TrendingUp,
    price: "$90/mo",
    rating: 4.7,
    reviews: 432,
    features: ["Live Dashboards", "Gamification", "TV Displays", "Integrations"],
    installed: false
  },

  // CRM & Sales Enablement
  {
    id: "hubspot-crm",
    name: "HubSpot CRM",
    description: "Contact and pipeline management suite",
    category: "Sales & CRM",
    icon: Users,
    price: "Free - $50/mo",
    rating: 4.8,
    reviews: 9876,
    features: ["Free CRM", "Email Tracking", "Meeting Scheduling", "Reporting"],
    popular: true,
    installed: false
  },
  {
    id: "zoho-crm",
    name: "Zoho CRM",
    description: "Modular CRM with email and finance extensions",
    category: "Sales & CRM",
    icon: Database,
    price: "$14/user/mo",
    rating: 4.6,
    reviews: 5432,
    features: ["Customizable", "AI Assistant", "Workflow Automation", "Modules"],
    installed: false
  },
  {
    id: "pipedrive",
    name: "Pipedrive",
    description: "Deal-focused sales pipeline tracker",
    category: "Sales & CRM",
    icon: TrendingUp,
    price: "$14.90/user/mo",
    rating: 4.7,
    reviews: 4321,
    features: ["Visual Pipeline", "Activity Reminders", "Email Integration", "Mobile App"],
    popular: true,
    installed: false
  },
  {
    id: "salesforce-essentials",
    name: "Salesforce Essentials",
    description: "SMB edition of Salesforce CRM",
    category: "Sales & CRM",
    icon: Cloud,
    price: "$25/user/mo",
    rating: 4.5,
    reviews: 3456,
    features: ["Salesforce Platform", "Email Integration", "Mobile App", "Support"],
    installed: false
  },
  {
    id: "insightly",
    name: "Insightly",
    description: "CRM plus project management in one",
    category: "Sales & CRM",
    icon: Briefcase,
    price: "$29/user/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["CRM", "Project Management", "Workflow Automation", "Reporting"],
    installed: false
  },
  {
    id: "copper",
    name: "Copper",
    description: "Google Workspace-native CRM",
    category: "Sales & CRM",
    icon: Mail,
    price: "$25/user/mo",
    rating: 4.7,
    reviews: 1876,
    features: ["Gmail Integration", "Google Workspace", "Pipeline Management", "Automation"],
    installed: false
  },
  {
    id: "streak",
    name: "Streak for Gmail",
    description: "Lightweight pipeline in your inbox",
    category: "Sales & CRM",
    icon: Mail,
    price: "$15/user/mo",
    rating: 4.5,
    reviews: 3456,
    features: ["Gmail Integration", "Email Tracking", "Pipeline View", "Collaboration"],
    installed: false
  },
  {
    id: "nimble",
    name: "Nimble",
    description: "Social CRM for relationship tracking",
    category: "Sales & CRM",
    icon: Share2,
    price: "$24.90/user/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["Social Integration", "Contact Enrichment", "Pipeline", "Email Tracking"],
    installed: false
  },
  {
    id: "keap",
    name: "Keap Max Classic",
    description: "CRM plus email automation for SMBs",
    category: "Sales & CRM",
    icon: Workflow,
    price: "$169/mo",
    rating: 4.4,
    reviews: 2345,
    features: ["CRM", "Marketing Automation", "E-commerce", "Appointments"],
    installed: false
  },
  {
    id: "capsule",
    name: "Capsule CRM",
    description: "Simple CRM with custom fields and tags",
    category: "Sales & CRM",
    icon: Database,
    price: "$18/user/mo",
    rating: 4.6,
    reviews: 987,
    features: ["Simple Interface", "Custom Fields", "Email Integration", "Pipeline"],
    installed: false
  },
  {
    id: "close-crm",
    name: "Close CRM",
    description: "Built-in dialer and email automation",
    category: "Sales & CRM",
    icon: Phone,
    price: "$29/user/mo",
    rating: 4.7,
    reviews: 1543,
    features: ["Power Dialer", "Email Sequences", "SMS", "Reporting"],
    installed: false
  },
  {
    id: "reply-io",
    name: "Reply.io",
    description: "Multichannel outbound automation for sales",
    category: "Sales & CRM",
    icon: Send,
    price: "$60/user/mo",
    rating: 4.6,
    reviews: 876,
    features: ["Email Sequences", "Multi-Channel", "AI Assistant", "Analytics"],
    installed: false
  },
  {
    id: "lemlist",
    name: "Lemlist",
    description: "Personalized email outreach automation",
    category: "Sales & CRM",
    icon: Mail,
    price: "$59/user/mo",
    rating: 4.7,
    reviews: 1234,
    features: ["Personalization", "Custom Images", "Follow-ups", "CRM Integration"],
    installed: false
  },
  {
    id: "apollo-io",
    name: "Apollo.io",
    description: "Lead database and sequencing platform",
    category: "Sales & CRM",
    icon: Database,
    price: "$49/user/mo",
    rating: 4.8,
    reviews: 2345,
    features: ["275M Contacts", "Email Sequences", "Dialer", "Chrome Extension"],
    popular: true,
    installed: false
  },
  {
    id: "seamless-ai",
    name: "Seamless.ai",
    description: "B2B contact discovery tool",
    category: "Sales & CRM",
    icon: Search,
    price: "Custom",
    rating: 4.5,
    reviews: 1876,
    features: ["Contact Discovery", "Real-Time Verification", "Chrome Extension", "CRM Integration"],
    installed: false
  },
  {
    id: "vidyard",
    name: "Vidyard",
    description: "Personalized video messaging for sales",
    category: "Sales & CRM",
    icon: Video,
    price: "$19/user/mo",
    rating: 4.6,
    reviews: 987,
    features: ["Video Messaging", "Screen Recording", "Analytics", "CRM Integration"],
    installed: false
  },
  {
    id: "drift",
    name: "Drift",
    description: "Conversational sales and chat automation",
    category: "Sales & CRM",
    icon: MessageCircle,
    price: "$2,500/mo",
    rating: 4.7,
    reviews: 1543,
    features: ["Live Chat", "Chatbots", "Playbooks", "ABM"],
    installed: false
  },
  {
    id: "intercom",
    name: "Intercom",
    description: "Live chat and customer engagement CRM",
    category: "Sales & CRM",
    icon: MessageSquare,
    price: "$39/mo",
    rating: 4.6,
    reviews: 3456,
    features: ["Live Chat", "Bots", "Product Tours", "Help Desk"],
    installed: false
  },
  {
    id: "freshsales",
    name: "Freshsales",
    description: "Affordable sales automation suite",
    category: "Sales & CRM",
    icon: Users,
    price: "$15/user/mo",
    rating: 4.5,
    reviews: 2345,
    features: ["CRM", "Email", "Phone", "AI Insights"],
    installed: false
  },
  {
    id: "zoho-bigin",
    name: "Zoho Bigin",
    description: "Simplified CRM for small teams",
    category: "Sales & CRM",
    icon: Users,
    price: "$7/user/mo",
    rating: 4.6,
    reviews: 876,
    features: ["Simple CRM", "Pipeline", "Telephony", "Mobile App"],
    installed: false
  },
  {
    id: "outreach-io",
    name: "Outreach.io",
    description: "Enterprise sales engagement automation",
    category: "Sales & CRM",
    icon: Target,
    price: "Custom",
    rating: 4.7,
    reviews: 1234,
    features: ["Sales Engagement", "Sequencing", "Dialer", "Analytics"],
    installed: false
  },
  {
    id: "salesloft",
    name: "SalesLoft",
    description: "Cadence and coaching platform for reps",
    category: "Sales & CRM",
    icon: TrendingUp,
    price: "Custom",
    rating: 4.6,
    reviews: 987,
    features: ["Sales Cadence", "Dialer", "Email", "Coaching"],
    installed: false
  },
  {
    id: "wingman",
    name: "Wingman",
    description: "AI call coaching and analytics tool",
    category: "Sales & CRM",
    icon: Headphones,
    price: "Custom",
    rating: 4.7,
    reviews: 543,
    features: ["Call Recording", "AI Coaching", "Analytics", "CRM Sync"],
    installed: false
  },
  {
    id: "chili-piper",
    name: "Chili Piper",
    description: "Smart meeting scheduling for leads",
    category: "Sales & CRM",
    icon: Calendar,
    price: "$15/user/mo",
    rating: 4.8,
    reviews: 876,
    features: ["Instant Booking", "Routing", "Form Concierge", "CRM Integration"],
    installed: false
  },
  {
    id: "docusign",
    name: "DocuSign",
    description: "Digital signature and contract management integration",
    category: "Sales & CRM",
    icon: FileText,
    price: "$10/user/mo",
    rating: 4.7,
    reviews: 8765,
    features: ["E-Signature", "Contract Management", "Templates", "Mobile"],
    popular: true,
    installed: false
  },

  // Reputation & Customer Experience
  {
    id: "podium",
    name: "Podium",
    description: "Unified inbox for reviews, messages, and payments via text",
    category: "Reputation",
    icon: MessageSquare,
    price: "$289/mo",
    rating: 4.7,
    reviews: 1876,
    features: ["Unified Inbox", "Review Requests", "Text Payments", "Webchat"],
    popular: true,
    installed: false
  },
  {
    id: "birdeye",
    name: "Birdeye",
    description: "Automated review requests and AI sentiment insights",
    category: "Reputation",
    icon: ThumbsUp,
    price: "Custom",
    rating: 4.6,
    reviews: 2345,
    features: ["Review Management", "Social Listening", "Surveys", "AI Insights"],
    installed: false
  },
  {
    id: "nicejob",
    name: "NiceJob",
    description: "Turns happy customers into 5-star reviews automatically",
    category: "Reputation",
    icon: Star,
    price: "$75/mo",
    rating: 4.8,
    reviews: 1234,
    features: ["Auto-Requests", "Multi-Platform", "Social Stories", "Monitoring"],
    installed: false
  },
  {
    id: "reviewpush",
    name: "ReviewPush",
    description: "Monitors and responds to reviews across 80 sites",
    category: "Reputation",
    icon: Eye,
    price: "$49/mo",
    rating: 4.5,
    reviews: 876,
    features: ["Review Monitoring", "Response Templates", "80+ Sites", "Analytics"],
    installed: false
  },
  {
    id: "gatherup",
    name: "GatherUp",
    description: "Review-gathering and NPS survey platform",
    category: "Reputation",
    icon: Star,
    price: "$99/mo",
    rating: 4.6,
    reviews: 765,
    features: ["Review Requests", "NPS Surveys", "Sentiment Analysis", "Widgets"],
    installed: false
  },
  {
    id: "grade-us",
    name: "Grade.us",
    description: "Customizable review funnels for agencies",
    category: "Reputation",
    icon: ThumbsUp,
    price: "$49/mo",
    rating: 4.7,
    reviews: 543,
    features: ["Review Funnels", "White Label", "Monitoring", "Reports"],
    installed: false
  },
  {
    id: "customer-voice-pro",
    name: "Customer Voice Pro",
    description: "White-label reputation-request system",
    category: "Reputation",
    icon: Mic,
    price: "$79/mo",
    rating: 4.5,
    reviews: 432,
    features: ["White Label", "Automated Requests", "Multi-Platform", "Analytics"],
    installed: false
  },
  {
    id: "survicate",
    name: "Survicate",
    description: "Embedded micro-surveys for customer feedback",
    category: "Reputation",
    icon: MessageCircle,
    price: "$59/mo",
    rating: 4.6,
    reviews: 654,
    features: ["Micro-Surveys", "Website Surveys", "Email Surveys", "NPS"],
    installed: false
  },
  {
    id: "delighted",
    name: "Delighted by Qualtrics",
    description: "One-click NPS surveys via email or SMS",
    category: "Reputation",
    icon: ThumbsUp,
    price: "Free - $224/mo",
    rating: 4.7,
    reviews: 987,
    features: ["NPS", "CSAT", "CES", "Multi-Channel"],
    installed: false
  },
  {
    id: "trustpilot",
    name: "Trustpilot Business",
    description: "Verified review collection and analytics",
    category: "Reputation",
    icon: Shield,
    price: "$199/mo",
    rating: 4.6,
    reviews: 3456,
    features: ["Verified Reviews", "TrustBox Widgets", "Seller Ratings", "Analytics"],
    installed: false
  },
  {
    id: "reevoo",
    name: "Reevoo",
    description: "Review content syndication for retail & automotive",
    category: "Reputation",
    icon: Star,
    price: "Custom",
    rating: 4.5,
    reviews: 543,
    features: ["Syndication", "Retail Focus", "Automotive", "Analytics"],
    installed: false
  },
  {
    id: "reviewinc",
    name: "ReviewInc",
    description: "Automates alerts and competitor rating tracking",
    category: "Reputation",
    icon: Bell,
    price: "$19.99/mo",
    rating: 4.6,
    reviews: 432,
    features: ["Review Alerts", "Competitor Tracking", "Response Templates", "Reporting"],
    installed: false
  },
  {
    id: "asknicely",
    name: "AskNicely",
    description: "Front-line employee recognition linked to NPS",
    category: "Reputation",
    icon: ThumbsUp,
    price: "$299/mo",
    rating: 4.7,
    reviews: 321,
    features: ["NPS", "Employee Recognition", "Customer Feedback", "Automation"],
    installed: false
  },
  {
    id: "review-shake",
    name: "Review Shake",
    description: "Agency-friendly white-label reputation suite",
    category: "Reputation",
    icon: Star,
    price: "$59/mo",
    rating: 4.5,
    reviews: 234,
    features: ["White Label", "Multi-Platform", "Automation", "Analytics"],
    installed: false
  },
  {
    id: "customer-gauge",
    name: "Customer Gauge",
    description: "B2B experience management and revenue feedback",
    category: "Reputation",
    icon: TrendingUp,
    price: "Custom",
    rating: 4.6,
    reviews: 456,
    features: ["B2B Focus", "Account-Based", "Revenue Tracking", "NPS"],
    installed: false
  },

  // Communication & Engagement
  {
    id: "twilio-sms",
    name: "Twilio SMS",
    description: "Programmable text messaging and alerts",
    category: "Communication",
    icon: MessageSquare,
    price: "$0.0079/msg",
    rating: 4.8,
    reviews: 5432,
    features: ["Programmable SMS", "Global Reach", "API", "Two-Way Messaging"],
    popular: true,
    installed: false
  },
  {
    id: "ringcentral",
    name: "RingCentral",
    description: "Cloud PBX phone and video platform",
    category: "Communication",
    icon: Phone,
    price: "$19.99/user/mo",
    rating: 4.6,
    reviews: 3456,
    features: ["VoIP Phone", "Video Meetings", "Team Messaging", "Analytics"],
    installed: false
  },
  {
    id: "zoom",
    name: "Zoom Meetings",
    description: "Video conferencing for teams and clients",
    category: "Communication",
    icon: Video,
    price: "Free - $19.99/mo",
    rating: 4.7,
    reviews: 12345,
    features: ["Video Meetings", "Webinars", "Screen Sharing", "Recording"],
    popular: true,
    installed: false
  },
  {
    id: "google-meet",
    name: "Google Meet",
    description: "Business-grade video meetings with Workspace integration",
    category: "Communication",
    icon: Video,
    price: "Included w/ Workspace",
    rating: 4.6,
    reviews: 8765,
    features: ["Video Meetings", "Google Integration", "Screen Sharing", "Recording"],
    installed: false
  },
  {
    id: "slack",
    name: "Slack Pro",
    description: "Real-time team collaboration channels",
    category: "Communication",
    icon: MessageCircle,
    price: "$7.25/user/mo",
    rating: 4.7,
    reviews: 9876,
    features: ["Channels", "Direct Messages", "File Sharing", "Integrations"],
    popular: true,
    installed: false
  },
  {
    id: "microsoft-teams",
    name: "Microsoft Teams",
    description: "Chat, video, and file collaboration inside Microsoft 365",
    category: "Communication",
    icon: Users,
    price: "Included w/ M365",
    rating: 4.6,
    reviews: 11234,
    features: ["Chat", "Video Meetings", "File Collaboration", "Office Integration"],
    installed: false
  },
  {
    id: "aircall",
    name: "Aircall",
    description: "VoIP sales and support phone system for CRMs",
    category: "Communication",
    icon: Phone,
    price: "$30/user/mo",
    rating: 4.5,
    reviews: 1234,
    features: ["Cloud Phone", "CRM Integration", "Call Recording", "Analytics"],
    installed: false
  },
  {
    id: "dialpad-ai",
    name: "Dialpad AI Voice",
    description: "AI-assisted call transcripts and summaries",
    category: "Communication",
    icon: Mic,
    price: "$15/user/mo",
    rating: 4.7,
    reviews: 987,
    features: ["AI Transcription", "Voice Intelligence", "Video Meetings", "SMS"],
    installed: false
  },
  {
    id: "grasshopper",
    name: "Grasshopper",
    description: "Virtual business numbers for solopreneurs",
    category: "Communication",
    icon: Phone,
    price: "$14/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Virtual Number", "Call Forwarding", "Voicemail", "Mobile App"],
    installed: false
  },
  {
    id: "openphone",
    name: "OpenPhone",
    description: "Modern mobile-first business calling app",
    category: "Communication",
    icon: Smartphone,
    price: "$13/user/mo",
    rating: 4.8,
    reviews: 1543,
    features: ["Business Number", "Shared Inbox", "Auto-Reply", "Integrations"],
    installed: false
  },
  {
    id: "zendesk-talk",
    name: "Zendesk Talk",
    description: "Integrated voice support in help desk tickets",
    category: "Communication",
    icon: Phone,
    price: "$19/agent/mo",
    rating: 4.5,
    reviews: 876,
    features: ["Phone Support", "Ticket Integration", "IVR", "Analytics"],
    installed: false
  },
  {
    id: "freshdesk-omni",
    name: "Freshdesk Omnichannel",
    description: "Support inbox for email, chat, and social",
    category: "Communication",
    icon: MessageSquare,
    price: "$15/agent/mo",
    rating: 4.6,
    reviews: 1876,
    features: ["Omnichannel", "Ticketing", "Knowledge Base", "Automation"],
    installed: false
  },
  {
    id: "olark",
    name: "Olark Live Chat",
    description: "Lightweight chat for websites",
    category: "Communication",
    icon: MessageCircle,
    price: "$29/agent/mo",
    rating: 4.5,
    reviews: 2345,
    features: ["Live Chat", "Automated Messages", "Transcripts", "Integrations"],
    installed: false
  },
  {
    id: "tidio",
    name: "Tidio Chatbot",
    description: "AI chat assistant for Shopify and SMBs",
    category: "Communication",
    icon: Bot,
    price: "Free - $25/mo",
    rating: 4.7,
    reviews: 3456,
    features: ["AI Chatbot", "Live Chat", "Email Integration", "Mobile App"],
    installed: false
  },
  {
    id: "crisp-chat",
    name: "Crisp Chat",
    description: "Multi-channel inbox with automated responses",
    category: "Communication",
    icon: MessageSquare,
    price: "Free - $25/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["Live Chat", "Chatbot", "Email", "Knowledge Base"],
    installed: false
  },
  {
    id: "front-app",
    name: "Front App",
    description: "Shared inbox combining email and messaging",
    category: "Communication",
    icon: Mail,
    price: "$19/user/mo",
    rating: 4.7,
    reviews: 987,
    features: ["Shared Inbox", "Email", "Chat", "Collaboration"],
    installed: false
  },
  {
    id: "messagebird",
    name: "MessageBird",
    description: "Global omnichannel messaging API",
    category: "Communication",
    icon: Send,
    price: "Pay as you go",
    rating: 4.6,
    reviews: 765,
    features: ["SMS", "WhatsApp", "Voice", "Email API"],
    installed: false
  },
  {
    id: "whatsapp-business",
    name: "WhatsApp Business API",
    description: "Two-way customer messaging automation",
    category: "Communication",
    icon: MessageCircle,
    price: "Custom",
    rating: 4.7,
    reviews: 4321,
    features: ["WhatsApp API", "Automation", "Templates", "Analytics"],
    popular: true,
    installed: false
  },
  {
    id: "heymarket",
    name: "Heymarket",
    description: "Shared SMS and WhatsApp for teams",
    category: "Communication",
    icon: MessageSquare,
    price: "$19/user/mo",
    rating: 4.6,
    reviews: 543,
    features: ["Shared Inbox", "SMS", "WhatsApp", "Broadcasts"],
    installed: false
  },
  {
    id: "zenvia-flow",
    name: "Zenvia Flow",
    description: "Workflow builder for SMS and chatbots",
    category: "Communication",
    icon: Workflow,
    price: "Custom",
    rating: 4.5,
    reviews: 321,
    features: ["Visual Builder", "SMS", "WhatsApp", "Chatbots"],
    installed: false
  },

  // HR & Operations
  {
    id: "bamboohr",
    name: "BambooHR",
    description: "Core HR, PTO, and onboarding software",
    category: "HR & Operations",
    icon: Users,
    price: "Custom",
    rating: 4.6,
    reviews: 2345,
    features: ["HR Management", "Onboarding", "Time Off", "Reporting"],
    popular: true,
    installed: false
  },
  {
    id: "gusto",
    name: "Gusto",
    description: "Payroll, benefits, and HR automation for SMBs",
    category: "HR & Operations",
    icon: DollarSign,
    price: "$40/mo + $6/person",
    rating: 4.8,
    reviews: 5432,
    features: ["Payroll", "Benefits", "Time Tracking", "HR Tools"],
    popular: true,
    installed: false
  },
  {
    id: "justworks",
    name: "Justworks",
    description: "PEO for payroll and compliance outsourcing",
    category: "HR & Operations",
    icon: ShieldCheck,
    price: "$49/person/mo",
    rating: 4.7,
    reviews: 1876,
    features: ["PEO", "Payroll", "Benefits", "Compliance"],
    installed: false
  },
  {
    id: "rippling",
    name: "Rippling",
    description: "Unified HR and IT provisioning for employees",
    category: "HR & Operations",
    icon: Workflow,
    price: "$8/user/mo",
    rating: 4.8,
    reviews: 3456,
    features: ["HR & IT", "Payroll", "Benefits", "Device Management"],
    popular: true,
    installed: false
  },
  {
    id: "workable",
    name: "Workable",
    description: "Applicant tracking and recruiting software",
    category: "HR & Operations",
    icon: UserPlus,
    price: "$149/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["ATS", "Job Posting", "Candidate Pipeline", "Video Interviews"],
    installed: false
  },
  {
    id: "jazzhr",
    name: "JazzHR",
    description: "Affordable recruiting and interview management",
    category: "HR & Operations",
    icon: Users,
    price: "$75/mo",
    rating: 4.5,
    reviews: 987,
    features: ["Recruiting", "Job Boards", "Candidate Tracking", "Collaboration"],
    installed: false
  },
  {
    id: "breezyhr",
    name: "BreezyHR",
    description: "Drag-and-drop candidate pipeline tool",
    category: "HR & Operations",
    icon: TrendingUp,
    price: "$143/mo",
    rating: 4.6,
    reviews: 765,
    features: ["Visual Pipeline", "Candidate Management", "Automation", "Reporting"],
    installed: false
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    description: "Enterprise ATS and interview analytics",
    category: "HR & Operations",
    icon: Building2,
    price: "Custom",
    rating: 4.7,
    reviews: 1543,
    features: ["Enterprise ATS", "Interview Kits", "Analytics", "Onboarding"],
    installed: false
  },
  {
    id: "lever",
    name: "Lever",
    description: "Talent acquisition CRM for scaling teams",
    category: "HR & Operations",
    icon: Users,
    price: "Custom",
    rating: 4.6,
    reviews: 1234,
    features: ["ATS + CRM", "Candidate Nurture", "Analytics", "Collaboration"],
    installed: false
  },
  {
    id: "trainual",
    name: "Trainual",
    description: "Standard operating procedure and training builder",
    category: "HR & Operations",
    icon: BookOpen,
    price: "$99/mo",
    rating: 4.8,
    reviews: 1876,
    features: ["SOPs", "Training", "Onboarding", "Testing"],
    installed: false
  },
  {
    id: "lattice",
    name: "Lattice",
    description: "Performance reviews and OKR tracking",
    category: "HR & Operations",
    icon: Target,
    price: "$11/person/mo",
    rating: 4.7,
    reviews: 987,
    features: ["Performance Reviews", "OKRs", "1-on-1s", "Engagement"],
    installed: false
  },
  {
    id: "15five",
    name: "15Five",
    description: "Employee engagement and weekly check-ins",
    category: "HR & Operations",
    icon: MessageCircle,
    price: "$4/person/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["Check-ins", "OKRs", "Performance", "Recognition"],
    installed: false
  },
  {
    id: "deel",
    name: "Deel",
    description: "Global contractor and payroll compliance platform",
    category: "HR & Operations",
    icon: Globe,
    price: "$49/contractor/mo",
    rating: 4.7,
    reviews: 3456,
    features: ["Global Payroll", "Compliance", "Contractor Management", "Benefits"],
    popular: true,
    installed: false
  },
  {
    id: "remote-com",
    name: "Remote.com",
    description: "International employment and benefits management",
    category: "HR & Operations",
    icon: Globe,
    price: "$29/contractor/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Global Employment", "Payroll", "Benefits", "Compliance"],
    installed: false
  },
  {
    id: "clockify",
    name: "Clockify",
    description: "Time tracking and timesheet reports",
    category: "HR & Operations",
    icon: Clock,
    price: "Free - $9.99/user/mo",
    rating: 4.7,
    reviews: 5432,
    features: ["Time Tracking", "Timesheets", "Reporting", "Project Tracking"],
    installed: false
  },
  {
    id: "when-i-work",
    name: "When I Work",
    description: "Shift scheduling and team communications",
    category: "HR & Operations",
    icon: Calendar,
    price: "$2/user/mo",
    rating: 4.5,
    reviews: 2345,
    features: ["Scheduling", "Time Clock", "Team Chat", "Shift Swapping"],
    installed: false
  },
  {
    id: "homebase",
    name: "Homebase",
    description: "Employee scheduling and time tracking for retail",
    category: "HR & Operations",
    icon: Store,
    price: "Free - $20/location/mo",
    rating: 4.6,
    reviews: 3456,
    features: ["Scheduling", "Time Clock", "Hiring", "Team Communication"],
    installed: false
  },
  {
    id: "deputy",
    name: "Deputy",
    description: "Workforce management with AI shift optimization",
    category: "HR & Operations",
    icon: Users,
    price: "$4.50/user/mo",
    rating: 4.7,
    reviews: 1876,
    features: ["Scheduling", "Time & Attendance", "Tasking", "Compliance"],
    installed: false
  },
  {
    id: "breathe-hr",
    name: "Breathe HR",
    description: "Simplified HR platform for small businesses",
    category: "HR & Operations",
    icon: Users,
    price: "$5/person/mo",
    rating: 4.5,
    reviews: 765,
    features: ["HR Records", "Holiday Tracking", "Performance", "Expense Management"],
    installed: false
  },
  {
    id: "zoho-people",
    name: "Zoho People",
    description: "All-in-one HR suite for SMEs",
    category: "HR & Operations",
    icon: Users,
    price: "$1.25/user/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["HR Management", "Time Tracking", "Performance", "Self-Service"],
    installed: false
  },

  // Finance & Billing
  {
    id: "quickbooks",
    name: "QuickBooks Online",
    description: "Cloud accounting and bookkeeping",
    category: "Finance & Billing",
    icon: Calculator,
    price: "$30/mo",
    rating: 4.7,
    reviews: 15432,
    features: ["Accounting", "Invoicing", "Expenses", "Reporting"],
    popular: true,
    installed: false
  },
  {
    id: "xero",
    name: "Xero",
    description: "Global accounting with bank feeds and reconciliation",
    category: "Finance & Billing",
    icon: PieChart,
    price: "$13/mo",
    rating: 4.6,
    reviews: 8765,
    features: ["Accounting", "Invoicing", "Bank Reconciliation", "Multi-Currency"],
    popular: true,
    installed: false
  },
  {
    id: "freshbooks",
    name: "FreshBooks",
    description: "Invoices and expenses for freelancers",
    category: "Finance & Billing",
    icon: Receipt,
    price: "$17/mo",
    rating: 4.6,
    reviews: 5432,
    features: ["Invoicing", "Expense Tracking", "Time Tracking", "Proposals"],
    installed: false
  },
  {
    id: "wave-accounting",
    name: "Wave Accounting",
    description: "Free accounting software for SMBs",
    category: "Finance & Billing",
    icon: Calculator,
    price: "Free",
    rating: 4.5,
    reviews: 6543,
    features: ["Accounting", "Invoicing", "Receipts", "Bank Connections"],
    installed: false
  },
  {
    id: "zoho-books",
    name: "Zoho Books",
    description: "Integrated accounting with CRM link",
    category: "Finance & Billing",
    icon: BookOpen,
    price: "$15/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Accounting", "Invoicing", "Inventory", "CRM Integration"],
    installed: false
  },
  {
    id: "bill-com",
    name: "Bill.com",
    description: "Automated accounts payable and receivable",
    category: "Finance & Billing",
    icon: Receipt,
    price: "$45/mo",
    rating: 4.7,
    reviews: 3456,
    features: ["AP Automation", "AR Automation", "Payments", "Approvals"],
    installed: false
  },
  {
    id: "melio",
    name: "Melio Payments",
    description: "Pay vendors with cards or ACH from one dashboard",
    category: "Finance & Billing",
    icon: CreditCard,
    price: "Free",
    rating: 4.8,
    reviews: 4321,
    features: ["Vendor Payments", "ACH", "Card Payments", "Payment Scheduling"],
    installed: false
  },
  {
    id: "expensify",
    name: "Expensify",
    description: "Receipt scanning and expense management",
    category: "Finance & Billing",
    icon: Camera,
    price: "$5/user/mo",
    rating: 4.6,
    reviews: 7654,
    features: ["Receipt Scanning", "Expense Reports", "Reimbursements", "Travel"],
    popular: true,
    installed: false
  },
  {
    id: "divvy",
    name: "Divvy",
    description: "Corporate cards and budget tracking",
    category: "Finance & Billing",
    icon: CreditCard,
    price: "Free",
    rating: 4.7,
    reviews: 2345,
    features: ["Corporate Cards", "Expense Management", "Budgets", "Accounting Sync"],
    installed: false
  },
  {
    id: "ramp",
    name: "Ramp",
    description: "Finance automation and spend controls",
    category: "Finance & Billing",
    icon: Wallet,
    price: "Free",
    rating: 4.8,
    reviews: 3456,
    features: ["Corporate Cards", "Expense Management", "Bill Pay", "Automation"],
    popular: true,
    installed: false
  },
  {
    id: "brex",
    name: "Brex",
    description: "Corporate credit and cash management for startups",
    category: "Finance & Billing",
    icon: CreditCard,
    price: "Free",
    rating: 4.6,
    reviews: 1876,
    features: ["Corporate Card", "Cash Management", "Expenses", "Rewards"],
    installed: false
  },
  {
    id: "stripe-billing",
    name: "Stripe Billing",
    description: "Subscriptions and recurring payments",
    category: "Finance & Billing",
    icon: Repeat,
    price: "0.5% + fees",
    rating: 4.7,
    reviews: 5432,
    features: ["Subscription Billing", "Invoicing", "Revenue Recognition", "Dunning"],
    popular: true,
    installed: false
  },
  {
    id: "square-invoicing",
    name: "Square Invoicing",
    description: "Quick quotes and invoice payments for local businesses",
    category: "Finance & Billing",
    icon: Receipt,
    price: "2.9% + $0.30",
    rating: 4.6,
    reviews: 4321,
    features: ["Invoicing", "Estimates", "Online Payments", "Recurring Invoices"],
    installed: false
  },
  {
    id: "intuit-payroll",
    name: "Intuit Payroll",
    description: "Integrated payroll with QuickBooks",
    category: "Finance & Billing",
    icon: DollarSign,
    price: "$45/mo + $5/person",
    rating: 4.5,
    reviews: 3456,
    features: ["Payroll", "Tax Filing", "QuickBooks Integration", "Direct Deposit"],
    installed: false
  },
  {
    id: "paychex-flex",
    name: "Paychex Flex",
    description: "Payroll and HR compliance solutions",
    category: "Finance & Billing",
    icon: Users,
    price: "Custom",
    rating: 4.4,
    reviews: 2345,
    features: ["Payroll", "HR", "Benefits", "Compliance"],
    installed: false
  },
  {
    id: "adp-run",
    name: "ADP Run",
    description: "Payroll automation for small enterprises",
    category: "Finance & Billing",
    icon: DollarSign,
    price: "Custom",
    rating: 4.5,
    reviews: 5432,
    features: ["Payroll", "Tax Filing", "Time Tracking", "HR Tools"],
    installed: false
  },
  {
    id: "bench-accounting",
    name: "Bench Accounting",
    description: "Bookkeeping service with real CPAs",
    category: "Finance & Billing",
    icon: Users,
    price: "$299/mo",
    rating: 4.7,
    reviews: 1234,
    features: ["Bookkeeping Service", "Monthly Reports", "Tax Support", "Dedicated Team"],
    installed: false
  },
  {
    id: "liveplan",
    name: "LivePlan",
    description: "Business planning and financial forecasting",
    category: "Finance & Billing",
    icon: TrendingUp,
    price: "$20/mo",
    rating: 4.6,
    reviews: 987,
    features: ["Business Plans", "Financial Forecasting", "Pitch Decks", "Dashboard"],
    installed: false
  },
  {
    id: "fathom",
    name: "Fathom",
    description: "Visual financial analysis for accountants",
    category: "Finance & Billing",
    icon: BarChart3,
    price: "$39/mo",
    rating: 4.7,
    reviews: 765,
    features: ["Financial Analysis", "KPI Tracking", "Reports", "Multi-Entity"],
    installed: false
  },
  {
    id: "spoton-payments",
    name: "SpotOn Payments",
    description: "POS and merchant services for hospitality",
    category: "Finance & Billing",
    icon: CreditCard,
    price: "Custom",
    rating: 4.6,
    reviews: 1543,
    features: ["POS System", "Payment Processing", "Marketing", "Loyalty"],
    installed: false
  },

  // IT & Security
  {
    id: "norton-business",
    name: "Norton Business",
    description: "Endpoint protection and device security",
    category: "IT & Security",
    icon: Shield,
    price: "$99.99/yr",
    rating: 4.5,
    reviews: 3456,
    features: ["Antivirus", "Firewall", "VPN", "Cloud Backup"],
    installed: false
  },
  {
    id: "mcafee-business",
    name: "McAfee Business Protect",
    description: "Malware and identity protection",
    category: "IT & Security",
    icon: ShieldCheck,
    price: "$59.99/yr",
    rating: 4.4,
    reviews: 2345,
    features: ["Antivirus", "Web Protection", "Firewall", "Identity Protection"],
    installed: false
  },
  {
    id: "bitdefender",
    name: "Bitdefender GravityZone",
    description: "Centralized antivirus management",
    category: "IT & Security",
    icon: Shield,
    price: "$49/device/yr",
    rating: 4.7,
    reviews: 1876,
    features: ["Endpoint Protection", "Central Management", "Ransomware Protection", "EDR"],
    installed: false
  },
  {
    id: "avast-business",
    name: "Avast Business CloudCare",
    description: "Security and web filtering portal",
    category: "IT & Security",
    icon: Cloud,
    price: "$30/device/yr",
    rating: 4.5,
    reviews: 1234,
    features: ["Antivirus", "Web Filtering", "Cloud Management", "Patch Management"],
    installed: false
  },
  {
    id: "malwarebytes-edr",
    name: "Malwarebytes EDR",
    description: "Endpoint detection and response tool",
    category: "IT & Security",
    icon: AlertCircle,
    price: "$69/device/yr",
    rating: 4.6,
    reviews: 987,
    features: ["EDR", "Threat Detection", "Remediation", "Reporting"],
    installed: false
  },
  {
    id: "barracuda-email",
    name: "Barracuda Email Security",
    description: "Spam and phishing defense",
    category: "IT & Security",
    icon: Mail,
    price: "$3/user/mo",
    rating: 4.6,
    reviews: 2345,
    features: ["Email Security", "Spam Filter", "Phishing Protection", "Encryption"],
    installed: false
  },
  {
    id: "proofpoint",
    name: "Proofpoint Essentials",
    description: "Email encryption and threat protection",
    category: "IT & Security",
    icon: Lock,
    price: "$2/user/mo",
    rating: 4.7,
    reviews: 1543,
    features: ["Email Security", "Encryption", "Archiving", "Continuity"],
    installed: false
  },
  {
    id: "acronis-backup",
    name: "Acronis Cyber Backup",
    description: "Cloud backup and disaster recovery",
    category: "IT & Security",
    icon: HardDrive,
    price: "$50/workstation/yr",
    rating: 4.6,
    reviews: 1876,
    features: ["Cloud Backup", "Disaster Recovery", "Anti-Malware", "Hybrid"],
    installed: false
  },
  {
    id: "datto-backupify",
    name: "Datto Backupify",
    description: "Google and Microsoft data backup solution",
    category: "IT & Security",
    icon: Cloud,
    price: "$3/user/mo",
    rating: 4.7,
    reviews: 987,
    features: ["SaaS Backup", "Google Workspace", "M365", "Automated"],
    installed: false
  },
  {
    id: "carbonite-safe",
    name: "Carbonite Safe Pro",
    description: "Automatic cloud backup for small teams",
    category: "IT & Security",
    icon: Cloud,
    price: "$287.88/yr",
    rating: 4.5,
    reviews: 1234,
    features: ["Cloud Backup", "Automatic", "External Drives", "Recovery"],
    installed: false
  },
  {
    id: "lastpass-teams",
    name: "LastPass Teams",
    description: "Password management and sharing",
    category: "IT & Security",
    icon: KeyRound,
    price: "$4/user/mo",
    rating: 4.6,
    reviews: 5432,
    features: ["Password Manager", "Shared Folders", "Multifactor Auth", "Policies"],
    popular: true,
    installed: false
  },
  {
    id: "1password",
    name: "1Password Business",
    description: "Secure credential vault for organizations",
    category: "IT & Security",
    icon: Lock,
    price: "$7.99/user/mo",
    rating: 4.8,
    reviews: 6543,
    features: ["Password Manager", "Vaults", "Travel Mode", "Admin Controls"],
    popular: true,
    installed: false
  },
  {
    id: "nordlayer",
    name: "NordLayer",
    description: "Business VPN and network encryption",
    category: "IT & Security",
    icon: Shield,
    price: "$8/user/mo",
    rating: 4.6,
    reviews: 987,
    features: ["Business VPN", "Network Segmentation", "Access Control", "Zero Trust"],
    installed: false
  },
  {
    id: "perimeter-81",
    name: "Perimeter 81",
    description: "Zero-trust network access as a service",
    category: "IT & Security",
    icon: Network,
    price: "$8/user/mo",
    rating: 4.7,
    reviews: 765,
    features: ["Zero Trust", "Secure Gateway", "Cloud VPN", "Network Segmentation"],
    installed: false
  },
  {
    id: "cloudflare-zero-trust",
    name: "Cloudflare Zero Trust",
    description: "Secure access and firewall rules in the cloud",
    category: "IT & Security",
    icon: Cloud,
    price: "$7/user/mo",
    rating: 4.8,
    reviews: 1543,
    features: ["Zero Trust", "Access", "Gateway", "Browser Isolation"],
    popular: true,
    installed: false
  },
  {
    id: "jumpcloud",
    name: "JumpCloud",
    description: "Directory-as-a-service for device management",
    category: "IT & Security",
    icon: Server,
    price: "$8/user/mo",
    rating: 4.6,
    reviews: 1234,
    features: ["Directory Service", "SSO", "MDM", "RADIUS"],
    installed: false
  },
  {
    id: "okta",
    name: "Okta Identity Cloud",
    description: "Single sign-on and MFA platform",
    category: "IT & Security",
    icon: Fingerprint,
    price: "$2/user/mo",
    rating: 4.7,
    reviews: 4321,
    features: ["SSO", "MFA", "Lifecycle Management", "Universal Directory"],
    popular: true,
    installed: false
  },
  {
    id: "duo-security",
    name: "Duo Security",
    description: "Two-factor authentication for all logins",
    category: "IT & Security",
    icon: Lock,
    price: "$3/user/mo",
    rating: 4.8,
    reviews: 3456,
    features: ["2FA", "MFA", "Device Trust", "Access Policies"],
    installed: false
  },
  {
    id: "keeper-security",
    name: "Keeper Security",
    description: "Encrypted password manager with BreachWatch",
    category: "IT & Security",
    icon: Shield,
    price: "$3.75/user/mo",
    rating: 4.7,
    reviews: 2345,
    features: ["Password Manager", "BreachWatch", "Encrypted Vault", "Compliance"],
    installed: false
  },
  {
    id: "bitwarden",
    name: "Bitwarden Business",
    description: "Open-source password manager for teams",
    category: "IT & Security",
    icon: KeyRound,
    price: "$3/user/mo",
    rating: 4.8,
    reviews: 4321,
    features: ["Open Source", "Password Manager", "Self-Hosted Option", "Compliance"],
    installed: false
  },

  // AI & Automation Tools
  {
    id: "zapier",
    name: "Zapier",
    description: "Connects apps and automates tasks without code",
    category: "Automation",
    icon: Zap,
    price: "Free - $29.99/mo",
    rating: 4.7,
    reviews: 8765,
    features: ["5000+ Apps", "No-Code Automation", "Multi-Step Zaps", "Webhooks"],
    popular: true,
    installed: false
  },
  {
    id: "make",
    name: "Make (Integromat)",
    description: "Visual workflow automation platform",
    category: "Automation",
    icon: Workflow,
    price: "Free - $9/mo",
    rating: 4.8,
    reviews: 5432,
    features: ["Visual Builder", "Advanced Logic", "API Integration", "Data Transformation"],
    popular: true,
    installed: false
  },
  {
    id: "chatgpt-business",
    name: "ChatGPT for Business",
    description: "AI assistant integration for support and sales",
    category: "AI Tools",
    icon: Bot,
    price: "$25/user/mo",
    rating: 4.9,
    reviews: 12345,
    features: ["GPT-4 Access", "Advanced Data Analysis", "Higher Limits", "Priority Access"],
    popular: true,
    installed: false
  },
  {
    id: "jasper-ai",
    name: "Jasper AI",
    description: "AI copywriting assistant for marketing teams",
    category: "AI Tools",
    icon: Pencil,
    price: "$39/mo",
    rating: 4.7,
    reviews: 6543,
    features: ["AI Copywriting", "Templates", "Brand Voice", "SEO Mode"],
    popular: true,
    installed: false
  },
  {
    id: "synthesia",
    name: "Synthesia Studio",
    description: "AI-generated video presenter platform",
    category: "AI Tools",
    icon: Video,
    price: "$30/mo",
    rating: 4.6,
    reviews: 1876,
    features: ["AI Avatars", "120+ Languages", "Screen Recording", "Custom Avatars"],
    installed: false
  }
];

const categories = [
  { name: "All Tools", count: tools.length },
  { name: "AI Tools", count: tools.filter(t => t.category === "AI Tools").length },
  { name: "Sales & CRM", count: tools.filter(t => t.category === "Sales & CRM").length },
  { name: "Marketing", count: tools.filter(t => t.category === "Marketing").length },
  { name: "Local SEO", count: tools.filter(t => t.category === "Local SEO").length },
  { name: "Advertising", count: tools.filter(t => t.category === "Advertising").length },
  { name: "Social Media", count: tools.filter(t => t.category === "Social Media").length },
  { name: "Content Creation", count: tools.filter(t => t.category === "Content Creation").length },
  { name: "Website", count: tools.filter(t => t.category === "Website").length },
  { name: "E-Commerce", count: tools.filter(t => t.category === "E-Commerce").length },
  { name: "Analytics", count: tools.filter(t => t.category === "Analytics").length },
  { name: "Reputation", count: tools.filter(t => t.category === "Reputation").length },
  { name: "Communication", count: tools.filter(t => t.category === "Communication").length },
  { name: "HR & Operations", count: tools.filter(t => t.category === "HR & Operations").length },
  { name: "Finance & Billing", count: tools.filter(t => t.category === "Finance & Billing").length },
  { name: "IT & Security", count: tools.filter(t => t.category === "IT & Security").length },
  { name: "Automation", count: tools.filter(t => t.category === "Automation").length },
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
          <TabsList className="flex flex-wrap gap-2 h-auto w-full bg-card p-2">
            {categories.map((cat) => (
              <TabsTrigger 
                key={cat.name} 
                value={cat.name} 
                className="flex-col py-2.5 px-4 min-w-[120px] data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="font-semibold whitespace-nowrap text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground data-[state=active]:text-primary-foreground/80">{cat.count}</span>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredTools.map((tool) => {
            const Icon = tool.icon;
            
            return (
              <Card 
                key={tool.id} 
                className={`p-4 md:p-6 shadow-elevated border transition-all hover:shadow-glow ${
                  tool.popular ? "border-primary/50" : "border-border"
                }`}
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-12 h-12 shrink-0 rounded-lg bg-gradient-primary flex items-center justify-center shadow-chrome">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base md:text-lg truncate">{tool.name}</h3>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                  {tool.popular && (
                    <Badge className="bg-primary/10 text-primary border-primary/30 shrink-0 self-start">
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