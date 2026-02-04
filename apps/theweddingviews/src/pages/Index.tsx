import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Users, Image, Palette, ShoppingBag, Menu, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import heroBackground from "@/assets/beach-wedding-hero.jpg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-elegant">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">The Wedding View</span>
          </div>
          
          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavLink to="/">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Home
                  </NavigationMenuLink>
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavLink to="/lite/new">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                    Projects
                  </NavigationMenuLink>
                </NavLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Services
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Blog
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

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
                <Link to="/lite/new" className="cursor-pointer">Projects</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>Services</DropdownMenuItem>
              <DropdownMenuItem>About</DropdownMenuItem>
              <DropdownMenuItem>Blog</DropdownMenuItem>
              <DropdownMenuItem>Contact</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/auth" className="cursor-pointer">Sign In</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBackground})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background/80 via-background/70 to-background/60" />
        
        <div className="container relative mx-auto px-4 pt-20 pb-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm mb-6 shadow-elegant">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Wedding Planning</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Design Your Dream Wedding
              <span className="block text-gradient-gold mt-2">in 3D Reality</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              Transform photos into immersive 3D spaces. Place décor, furniture, and florals with AI guidance. Connect with local vendors. Perfect your vision before the big day.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/lite/new">
                <Button size="lg" className="text-lg px-8 py-6 shadow-gold hover:scale-105 transition-smooth">
                  Start Planning Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 hover:bg-secondary/50 transition-smooth">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Tabs */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          Everything You Need to Plan
        </h2>
        
        <Tabs defaultValue="features" className="max-w-6xl mx-auto">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-12">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="how-it-works">How It Works</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Image className="w-8 h-8 text-primary" />}
                title="Photo to 3D Magic"
                description="Upload venue photos and watch AI transform them into interactive 3D environments you can explore and customize."
              />
              <FeatureCard
                icon={<Palette className="w-8 h-8 text-primary" />}
                title="Design in Real-Time"
                description="Drag, drop, and style every detail—florals, furniture, lighting, linens. See your vision come to life instantly."
              />
              <FeatureCard
                icon={<Sparkles className="w-8 h-8 text-primary" />}
                title="Meet Viewy, Your AI Planner"
                description="Chat or speak naturally to get layout suggestions, vendor recommendations, and budget guidance."
              />
              <FeatureCard
                icon={<ShoppingBag className="w-8 h-8 text-primary" />}
                title="Local Vendor Marketplace"
                description="Discover curated florists, rental companies, caterers, and more—all in one place with transparent pricing."
              />
              <FeatureCard
                icon={<Users className="w-8 h-8 text-primary" />}
                title="Collaborate & Share"
                description="Invite your partner, planner, or family to view and comment. Share stunning visuals with vendors."
              />
              <FeatureCard
                icon={<ArrowRight className="w-8 h-8 text-primary" />}
                title="Export & Book"
                description="Export high-quality renders, detailed item lists, and connect directly with vendors to book."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="how-it-works">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<span className="text-2xl font-bold text-primary">1</span>}
                title="Upload Your Photos"
                description="Take pictures of your venue or outdoor space. Our AI will convert them into a 3D environment."
              />
              <FeatureCard
                icon={<span className="text-2xl font-bold text-primary">2</span>}
                title="Design Your Vision"
                description="Place furniture, florals, and décor. Adjust colors, lighting, and layouts in real-time 3D."
              />
              <FeatureCard
                icon={<span className="text-2xl font-bold text-primary">3</span>}
                title="Book with Confidence"
                description="Share with vendors, get accurate quotes, and book knowing exactly what you're getting."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="pricing">
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-card rounded-xl p-8 shadow-elegant border border-border">
                <h3 className="text-2xl font-bold mb-2">Lite</h3>
                <p className="text-3xl font-bold text-primary mb-4">Free</p>
                <ul className="space-y-2 text-muted-foreground mb-6">
                  <li>✓ 1 project</li>
                  <li>✓ Basic 3D design tools</li>
                  <li>✓ Local vendor discovery</li>
                  <li>✓ Export low-res renders</li>
                </ul>
                <Link to="/lite/new">
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
              <div className="bg-gradient-romantic rounded-xl p-8 shadow-elegant border border-primary/20">
                <h3 className="text-2xl font-bold mb-2">Pro</h3>
                <p className="text-3xl font-bold mb-4">$29/month</p>
                <ul className="space-y-2 mb-6">
                  <li>✓ Unlimited projects</li>
                  <li>✓ Advanced AI guidance</li>
                  <li>✓ HD renders & exports</li>
                  <li>✓ Collaboration tools</li>
                  <li>✓ Priority support</li>
                </ul>
                <Button variant="secondary" className="w-full bg-background">Upgrade to Pro</Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* CTA Sections */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Couples CTA */}
          <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border hover:shadow-gold transition-elegant">
            <h3 className="text-2xl font-bold mb-4">For Couples</h3>
            <p className="text-muted-foreground mb-6">
              Start with our free Lite plan. Design your backyard ceremony, discover local vendors, and visualize every detail before booking.
            </p>
            <Link to="/lite/new">
              <Button className="w-full shadow-soft hover:scale-105 transition-smooth">
                Try Lite for Free
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Venues CTA */}
          <div className="bg-gradient-romantic rounded-2xl p-8 shadow-elegant border border-primary/20 hover:shadow-gold transition-elegant">
            <h3 className="text-2xl font-bold mb-4">For Venues & Resorts</h3>
            <p className="text-foreground/80 mb-6">
              Showcase your space with a 3D digital twin. Offer customizable themes, track analytics, and convert browsers into bookings.
            </p>
            <Button variant="secondary" className="w-full bg-background hover:bg-background/90 shadow-soft hover:scale-105 transition-smooth">
              Request a Demo
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2025 The Wedding View. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <div className="bg-card rounded-xl p-6 shadow-elegant border border-border hover:shadow-medium hover:border-primary/20 transition-elegant group">
      <div className="mb-4 inline-flex p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-smooth">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
};

export default Index;
