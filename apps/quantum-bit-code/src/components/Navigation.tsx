import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  Settings,
  Hexagon,
  Languages,
  Building2,
  Menu,
  Sparkles,
  Zap,
  Lock,
  BookOpen,
  ShoppingBag,
  FlaskConical,
  Inbox,
  Award,
  FileText,
  Home,
  ChevronDown,
  X,
  LogOut,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/useUserRole";
import { QBCDecryptedText } from "@/components/QBCDecryptedText";
import { useQBCScript } from "@/contexts/QBCScriptContext";
import { cn } from "@/lib/utils";

const qbcMenuItems = [
  { label: "Quick Generate", href: "/qbc", icon: Zap, description: "Fast glyph generation" },
  { label: "Simulator", href: "/qbc/simulator", icon: Sparkles, description: "Full encoding simulator" },
  { label: "Decoder", href: "/qbc/decode", icon: Lock, description: "Decode glyphs back to text" },
  { label: "Library", href: "/qbc/library", icon: BookOpen, description: "Rosetta glyph collection" },
  { label: "Products", href: "/qbc/products", icon: ShoppingBag, description: "Create physical products" },
  { label: "QBC Lab", href: "/qbc/experimental", icon: FlaskConical, description: "Composite QBC encoder" },
  { label: "Inbox", href: "/qbc/inbox", icon: Inbox, description: "Peer-to-peer messages" },
];

const resourceMenuItems = [
  { label: "White Paper", href: "/whitepaper", icon: FileText, description: "Technical documentation" },
  { label: "Compliance", href: "/compliance", icon: Shield, description: "Security frameworks" },
];

const Navigation = () => {
  const { isAdmin, userId } = useUserRole();
  const { isQBCMode, toggleMode, isReady } = useQBCScript();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [qbcOpen, setQbcOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isActive = (href: string) => location.pathname === href;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
    toast({ title: "Signed out successfully" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container px-4 md:px-6 py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-primary transition-colors">
            <Hexagon className="h-6 w-6 text-primary" />
            <span className="hidden sm:inline">
              <QBCDecryptedText text="QBC" animateOn="hover" speed={40} maxIterations={10} glyphHeight="1.5rem" />
            </span>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavigationMenu>
              <NavigationMenuList>
                {/* Home */}
                <NavigationMenuItem>
                  <NavLink to="/home">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                      isActive("/home") && "bg-accent/50"
                    )}>
                      <Home className="h-4 w-4 mr-1.5" />
                      Home
                    </NavigationMenuLink>
                  </NavLink>
                </NavigationMenuItem>

                {/* QBC Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    <Hexagon className="h-4 w-4 mr-1.5" />
                    QBC
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-1 p-3 md:w-[500px] md:grid-cols-2">
                      {qbcMenuItems.map((item) => (
                        <li key={item.href}>
                          <NavLink to={item.href}>
                            <NavigationMenuLink className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                              isActive(item.href) && "bg-accent/50"
                            )}>
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <item.icon className="h-4 w-4 text-primary" />
                                {item.label}
                              </div>
                              <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </NavigationMenuLink>
                          </NavLink>
                        </li>
                      ))}
                      {/* My Claims - requires auth */}
                      {userId && (
                        <li>
                          <NavLink to="/claims">
                            <NavigationMenuLink className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActive("/claims") && "bg-accent/50"
                            )}>
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Award className="h-4 w-4 text-primary" />
                                My Claims
                              </div>
                              <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
                                Your claimed glyphs
                              </p>
                            </NavigationMenuLink>
                          </NavLink>
                        </li>
                      )}
                      {/* QBC Admin - admin only */}
                      {isAdmin && (
                        <li>
                          <NavLink to="/qbc/admin">
                            <NavigationMenuLink className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActive("/qbc/admin") && "bg-accent/50"
                            )}>
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <Settings className="h-4 w-4 text-primary" />
                                QBC Admin
                              </div>
                              <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
                                Manage lattices & settings
                              </p>
                            </NavigationMenuLink>
                          </NavLink>
                        </li>
                      )}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Resources Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="bg-transparent">
                    <FileText className="h-4 w-4 mr-1.5" />
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[300px] gap-1 p-3">
                      {resourceMenuItems.map((item) => (
                        <li key={item.href}>
                          <NavLink to={item.href}>
                            <NavigationMenuLink className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                              isActive(item.href) && "bg-accent/50"
                            )}>
                              <div className="flex items-center gap-2 text-sm font-medium leading-none">
                                <item.icon className="h-4 w-4 text-primary" />
                                {item.label}
                              </div>
                              <p className="line-clamp-1 text-xs leading-snug text-muted-foreground">
                                {item.description}
                              </p>
                            </NavigationMenuLink>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                {/* Government */}
                <NavigationMenuItem>
                  <NavLink to="/government">
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive("/government") && "bg-accent/50"
                    )}>
                      <Building2 className="h-4 w-4 mr-1.5" />
                      Government
                    </NavigationMenuLink>
                  </NavLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2">
            {/* EN/QBC Toggle */}
            {isReady && (
              <button
                onClick={toggleMode}
                className={cn(
                  'hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
                  isQBCMode
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                )}
              >
                <Languages className="h-4 w-4" />
                <span>{isQBCMode ? 'QBC' : 'EN'}</span>
              </button>
            )}

            {/* Desktop Auth/Admin buttons */}
            <div className="hidden md:flex items-center gap-2">
              {userId ? (
                <>
                  {isAdmin && (
                    <NavLink to="/admin">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </NavLink>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-primary/50 hover:border-primary hover:bg-primary/10">
                        <User className="h-4 w-4 mr-2" />
                        Account
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => navigate('/claims')}>
                        <Award className="h-4 w-4 mr-2" />
                        My Claims
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <NavLink to="/auth">
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Shield className="h-4 w-4 mr-2" />
                    Access Portal
                  </Button>
                </NavLink>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Hexagon className="h-5 w-5 text-primary" />
                    QBC Menu
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 flex flex-col gap-2">
                  {/* Home */}
                  <NavLink
                    to="/home"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive("/home") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                  >
                    <Home className="h-5 w-5" />
                    Home
                  </NavLink>

                  {/* QBC Section */}
                  <Collapsible open={qbcOpen} onOpenChange={setQbcOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Hexagon className="h-5 w-5" />
                        QBC
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", qbcOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 mt-1 space-y-1">
                      {qbcMenuItems.map((item) => (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive(item.href) ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      ))}
                      {userId && (
                        <NavLink
                          to="/claims"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive("/claims") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                        >
                          <Award className="h-4 w-4" />
                          My Claims
                        </NavLink>
                      )}
                      {isAdmin && (
                        <NavLink
                          to="/qbc/admin"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive("/qbc/admin") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                        >
                          <Settings className="h-4 w-4" />
                          QBC Admin
                        </NavLink>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Resources Section */}
                  <Collapsible open={resourcesOpen} onOpenChange={setResourcesOpen}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5" />
                        Resources
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", resourcesOpen && "rotate-180")} />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6 mt-1 space-y-1">
                      {resourceMenuItems.map((item) => (
                        <NavLink
                          key={item.href}
                          to={item.href}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                            isActive(item.href) ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavLink>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Government */}
                  <NavLink
                    to="/government"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isActive("/government") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                  >
                    <Building2 className="h-5 w-5" />
                    Government
                  </NavLink>

                  <div className="border-t border-border my-2" />

                  {/* EN/QBC Toggle Mobile */}
                  {isReady && (
                    <button
                      onClick={toggleMode}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                        isQBCMode
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <Languages className="h-5 w-5" />
                      {isQBCMode ? 'Switch to English' : 'Switch to QBC Script'}
                    </button>
                  )}

                  {/* Auth Section */}
                  {userId ? (
                    <>
                      {isAdmin && (
                        <NavLink
                          to="/admin"
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                            isActive("/admin") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                          )}
                        >
                          <Settings className="h-5 w-5" />
                          Admin Panel
                        </NavLink>
                      )}
                      <NavLink
                        to="/claims"
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive("/claims") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                        )}
                      >
                        <Award className="h-5 w-5" />
                        My Claims
                      </NavLink>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <NavLink
                      to="/auth"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground"
                    >
                      <Shield className="h-5 w-5" />
                      Access Portal
                    </NavLink>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
