import { Button } from "@/components/ui/button";
import { ArrowRight, Scan, Camera, Sparkles, ShoppingCart, FolderOpen, Box, Menu, QrCode, Link2, Move, Share2, Check, Smartphone, Globe, Zap, Building2, Layers, Network, TrendingUp, Users, Lightbulb, Target, ChevronRight, Play, Eye, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import photorealistic hero images
import heroRoomLiving from "@/assets/hero-room-living.jpg";
import heroRoomKitchen from "@/assets/hero-room-kitchen.jpg";
import productPickerUI from "@/assets/product-picker-ui.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Eye className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">The Product View</span>
          </div>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/visualize">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Visualize
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/projects">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Projects
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Platform</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="w-80 p-4 space-y-2">
                    <div className="p-3 rounded-lg hover:bg-muted transition-smooth cursor-pointer">
                      <div className="font-medium text-sm">The Wedding View</div>
                      <p className="text-xs text-muted-foreground">Venue visualization for couples</p>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-muted transition-smooth cursor-pointer">
                      <div className="font-medium text-sm">Executive Housing View</div>
                      <p className="text-xs text-muted-foreground">Corporate relocation solutions</p>
                    </div>
                    <div className="p-3 rounded-lg hover:bg-muted transition-smooth cursor-pointer">
                      <div className="font-medium text-sm">Asset Services Marketplace</div>
                      <p className="text-xs text-muted-foreground">B2B procurement channel</p>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/settings">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Settings
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          <div className="hidden md:flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/visualize">
              <Button className="bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow">
                Try It Free
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background">
              <DropdownMenuLabel>Navigation</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/" className="cursor-pointer">Home</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/visualize" className="cursor-pointer">Visualize</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/projects" className="cursor-pointer">Projects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Platform</DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth" className="cursor-pointer">Sign In</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Hero Section - Photorealistic Room */}
      <section className="relative overflow-hidden pt-24 pb-12 min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={heroRoomLiving} 
            alt="Modern living room visualization" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />
        </div>
        
        <div className="container relative mx-auto px-4">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Spatial Commerce Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              The Sentient
              <span className="block text-gradient-primary mt-2">Asset</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-4 leading-relaxed">
              We don't just create digital twins. We create <strong className="text-foreground">intelligent, interactive, and value-generating</strong> counterparts to the physical world.
            </p>
            
            <p className="text-lg text-muted-foreground mb-8">
              Transform every space into an interactive, shoppable experience. Preview any product in your actual room before you buy.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link to="/visualize">
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-primary hover:opacity-90 transition-smooth shadow-glow">
                  Start Visualizing
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass transition-smooth">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>Works with any product</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>AI-powered placement</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                <span>5 free previews/month</span>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Product Picker UI Overlay */}
        <div className="absolute bottom-8 right-8 hidden lg:block">
          <div className="glass-card rounded-2xl p-4 shadow-medium max-w-md">
            <p className="text-sm text-muted-foreground mb-3">"Show me what these would look like in my room"</p>
            <div className="flex gap-2 items-center">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Box className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                <Layers className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1" />
              <div className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium flex items-center gap-2">
                <Wand2 className="w-4 h-4" />
                Visualize
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Product View Layer Section */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">The Concept</span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">
                The Product View Layer
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                The digital twin becomes a dynamic e-commerce layer. Users can explore a space and interact with representations of real-world products.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Partner with Retailers</h4>
                    <p className="text-sm text-muted-foreground">Integrate product catalogs from Home Depot, Wayfair, Crate & Barrel</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Place Products</h4>
                    <p className="text-sm text-muted-foreground">Virtually stage spaces with shoppable 3D models</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-primary font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Drive Commerce</h4>
                    <p className="text-sm text-muted-foreground">Generate affiliate revenue from purchases or direct leads</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src={heroRoomKitchen} 
                alt="Interactive product visualization" 
                className="rounded-2xl shadow-medium w-full"
              />
              {/* Interactive hotspots overlay */}
              <div className="absolute top-1/4 right-1/4 glass-card rounded-lg px-3 py-2 text-sm shadow-soft">
                <span className="text-muted-foreground">View specs at</span>
                <span className="font-semibold ml-1">Home Depot</span>
                <ChevronRight className="inline w-4 h-4 ml-1" />
              </div>
              <div className="absolute bottom-1/3 left-1/4 glass-card rounded-lg px-3 py-2 text-sm shadow-soft">
                <span className="text-muted-foreground">Shop this look from</span>
                <span className="font-semibold ml-1">West Elm</span>
                <ChevronRight className="inline w-4 h-4 ml-1" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Horizon Roadmap - Key Strategy Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">Platform Evolution</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              The Journey from Visualization to Intelligence
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              A three-horizon roadmap for building real estate's intelligent operating system
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Horizon 1 */}
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 h-full border-l-4 border-primary">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
                  HORIZON 1
                </div>
                <h3 className="text-2xl font-bold mb-2">Optimize the Core</h3>
                <p className="text-sm text-muted-foreground mb-4">Today - 18 Months</p>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Asset Evolution</span>
                  <p className="font-medium text-primary mt-1">Senses & Memory</p>
                </div>
                <p className="text-muted-foreground mb-6">
                  Automate and scale our current high-value services. The Digital Twin gains intelligence—becoming a tool for engagement.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>AI-powered sales automation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>HubSpot CRM integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Relationship OS</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Horizon 2 */}
            <div className="relative">
              <div className="glass-card rounded-2xl p-8 h-full border-l-4 border-accent">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-semibold mb-4">
                  HORIZON 2
                </div>
                <h3 className="text-2xl font-bold mb-2">Build Adjacent Platforms</h3>
                <p className="text-sm text-muted-foreground mb-4">18 - 36 Months</p>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">Asset Evolution</span>
                  <p className="font-medium text-accent mt-1">Agency</p>
                </div>
                <p className="text-muted-foreground mb-6">
                  Launch new, scalable revenue streams. The Sentient Asset gains Agency—actively improving real-world properties.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    <span>The Product View Layer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    <span>EnWaTel Retrofit Engine</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent" />
                    <span>Services Marketplace</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Horizon 3 */}
            <div className="relative">
              <div className="rounded-2xl p-8 h-full border-l-4 border-[hsl(232,47%,28%)] bg-gradient-dark text-primary-foreground">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-sm font-semibold mb-4">
                  HORIZON 3
                </div>
                <h3 className="text-2xl font-bold mb-2">Create the Future</h3>
                <p className="text-sm text-white/70 mb-4">3+ Years</p>
                <div className="mb-6">
                  <span className="text-xs uppercase tracking-wider text-white/60">Asset Evolution</span>
                  <p className="font-medium text-white mt-1">Collective Intelligence</p>
                </div>
                <p className="text-white/80 mb-6">
                  Build the definitive, predictive model of the global real estate market using Graph Neural Networks.
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span>Digital Twin of the World</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span>Predictive Intelligence</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-white" />
                    <span>GNN-powered analytics</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From product to placement in seconds. No technical skills required.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <StepCard
              number={1}
              icon={<QrCode className="w-6 h-6" />}
              title="Add Product"
              description="Scan a QR code, paste a URL, or search from major retailers"
            />
            <StepCard
              number={2}
              icon={<Camera className="w-6 h-6" />}
              title="Capture Space"
              description="Take a photo of your room or upload an existing image"
            />
            <StepCard
              number={3}
              icon={<Move className="w-6 h-6" />}
              title="Place & Adjust"
              description="AI places the product with accurate scale and lighting"
            />
            <StepCard
              number={4}
              icon={<ShoppingCart className="w-6 h-6" />}
              title="Buy or Share"
              description="Purchase directly or share your visualization"
            />
          </div>
        </div>
      </section>

      {/* Expansion Verticals */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">Expansion Verticals</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Beyond Product Visualization
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <VerticalCard
              icon={<Users className="w-8 h-8" />}
              title="The Wedding View"
              description="Allow couples to tour venues and visualize setups with preferred vendors—florists, DJs, caterers—booking directly through the platform."
            />
            <VerticalCard
              icon={<Building2 className="w-8 h-8" />}
              title="Executive Housing View"
              description="Furnish units with partner items tailored to corporate clients, simplifying the relocation process for companies."
            />
            <VerticalCard
              icon={<Network className="w-8 h-8" />}
              title="Services Marketplace"
              description="Become the trusted, digitally-enabled procurement channel for telecom, EV charging, energy solutions, and staffing."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make confident purchase decisions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Scan className="w-8 h-8 text-primary" />}
              title="Universal Compatibility"
              description="Works with any product from any retailer. No pre-uploaded 3D files needed—AI creates assets from images."
            />
            <FeatureCard
              icon={<Sparkles className="w-8 h-8 text-primary" />}
              title="AI-Powered Placement"
              description="Smart detection of floors, walls, and surfaces. Accurate scale and realistic lighting matching."
            />
            <FeatureCard
              icon={<FolderOpen className="w-8 h-8 text-primary" />}
              title="Project Folders"
              description="Organize visualizations by room or project. Perfect for renovations, staging, or comparing options."
            />
            <FeatureCard
              icon={<Share2 className="w-8 h-8 text-primary" />}
              title="Share & Collaborate"
              description="Share visualizations with family, designers, or vendors. Get feedback before you buy."
            />
            <FeatureCard
              icon={<Link2 className="w-8 h-8 text-primary" />}
              title="Affiliate Commerce"
              description="One-tap buy buttons redirect to retailer checkout. Generate affiliate revenue from purchases."
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8 text-primary" />}
              title="Fit Warnings"
              description="Get alerts if a product appears too large for the detected space. Avoid costly returns."
            />
          </div>
        </div>
      </section>

      {/* Flywheel Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <span className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 block">The Flywheel Effect</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              A Self-Reinforcing Ecosystem
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              More Digital Twins create more opportunities for Agency services. More Agency services create stickier client relationships and more data. This data helps us sell more services, spinning the wheel faster.
            </p>
            
            <div className="grid md:grid-cols-4 gap-6">
              <FlywheelStep number="1" title="Capture & Digitize" description="Create the foundational Digital Twin" />
              <FlywheelStep number="2" title="Enhance & Market" description="Use twin for pre-leasing and sales" />
              <FlywheelStep number="3" title="Optimize & Operate" description="Introduce Agency layer services" />
              <FlywheelStep number="4" title="Deepen & Expand" description="Strategic relationship growth" />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-24 bg-gradient-hero">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Perfect For
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <UseCaseCard
              title="Home Furniture"
              items={["Sofas & Chairs", "Tables & Desks", "Beds & Dressers"]}
            />
            <UseCaseCard
              title="Lighting & Decor"
              items={["Lamps & Fixtures", "Wall Art", "Rugs & Curtains"]}
            />
            <UseCaseCard
              title="Kitchen & Bath"
              items={["Faucets & Sinks", "Appliances", "Cabinets"]}
            />
            <UseCaseCard
              title="Outdoor Living"
              items={["Patio Furniture", "Grills & Fire Pits", "Garden Items"]}
            />
          </div>
        </div>
      </section>

      {/* Platform Support */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Works Everywhere
            </h2>
            <p className="text-muted-foreground">
              Cross-platform support with no app downloads required
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-full">
              <Smartphone className="w-5 h-5 text-primary" />
              <span>iOS & Android</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-full">
              <Globe className="w-5 h-5 text-primary" />
              <span>Web Browser</span>
            </div>
            <div className="flex items-center gap-3 px-6 py-3 glass-card rounded-full">
              <QrCode className="w-5 h-5 text-primary" />
              <span>QR Code Activation</span>
            </div>
          </div>
        </div>
      </section>

      {/* Biz Dev Platform Integration Note */}
      <section className="py-16 bg-gradient-dark text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4" />
              Coming Soon: Biz Dev Platform Integration
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Part of a Larger Ecosystem
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              The Product View is designed to integrate seamlessly with the Biz Dev Platform—a comprehensive business operating system featuring CRM, Deal Rooms, Workflow Automation, Research Studio, and AI-powered insights powered by the Unity Meridian architecture.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-white/70">
              <span className="px-3 py-1 rounded-full border border-white/20">260+ Tools</span>
              <span className="px-3 py-1 rounded-full border border-white/20">71+ Services</span>
              <span className="px-3 py-1 rounded-full border border-white/20">AGI Architecture</span>
              <span className="px-3 py-1 rounded-full border border-white/20">Two Rails System</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-primary opacity-90" />
              <div className="relative px-8 py-16 md:px-16 text-center text-primary-foreground">
                <h2 className="text-3xl md:text-5xl font-bold mb-4">
                  Ready to See It In Your Space?
                </h2>
                <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                  Start with 5 free visualizations. No credit card required. 
                  No app download needed.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/visualize">
                    <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-background text-foreground hover:bg-background/90">
                      Start Free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Button size="lg" variant="ghost" className="text-lg px-8 py-6 text-primary-foreground border border-primary-foreground/30 hover:bg-primary-foreground/10">
                    Enterprise Solutions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                  <Eye className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold">The Product View</span>
              </div>
              <p className="text-sm text-muted-foreground">
                The intelligent operating system for the built world. See products in your space before you buy.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">API</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Verticals</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Retailers</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Wedding View</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Executive Housing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">White Label</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 The Product View — A Sentient Asset Company. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StepCard = ({ number, icon, title, description }: { number: number; icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="relative text-center">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="pt-8 glass-card rounded-2xl p-6">
        <div className="w-14 h-14 mx-auto mb-4 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="glass-card rounded-2xl p-6 hover:shadow-medium transition-smooth">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

const VerticalCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="glass-card rounded-2xl p-8 text-center hover:shadow-medium transition-smooth">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-primary flex items-center justify-center text-primary-foreground">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};

const UseCaseCard = ({ title, items }: { title: string; items: string[] }) => {
  return (
    <div className="glass-card rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FlywheelStep = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <div className="text-center">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
        {number}
      </div>
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default Index;
