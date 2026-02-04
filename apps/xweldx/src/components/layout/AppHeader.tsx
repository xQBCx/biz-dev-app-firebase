import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Icons, WeldSparkIcon } from "@/components/icons/IndustrialIcons";
import { cn } from "@/lib/utils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { CartDrawer } from "@/components/shop/CartDrawer";
import { ShoppingBag } from "lucide-react";

const navItems = [
  { icon: Icons.home, label: "Dashboard", path: "/" },
  { icon: Icons.clipboard, label: "Inspections", path: "/inspections" },
  { icon: Icons.target, label: "Pipe Supports", path: "/supports" },
  { icon: Icons.barChart, label: "Analytics", path: "/analytics" },
  { icon: Icons.fileText, label: "Reports", path: "/reports" },
  { icon: ShoppingBag, label: "Shop", path: "/shop" },
  { icon: Icons.settings, label: "Settings", path: "/settings" },
];

export function AppHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/auth");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-orange-600">
              <WeldSparkIcon className="h-6 w-6 text-white" />
            </div>
            <motion.div
              className="absolute inset-0 rounded-lg bg-accent/30"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-black uppercase tracking-wider">
              Weld Inspector
            </h1>
            <p className="text-xs text-muted-foreground">
              Piping Technology & Products
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex ml-8">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive ? "industrial" : "ghost"}
                  size="sm"
                  className={cn(
                    "gap-2",
                    !isActive && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          <CartDrawer />
          
          <Button variant="outline" size="sm" className="hidden sm:flex">
            <Icons.glasses className="h-4 w-4" />
            <span className="ml-2">Connect AR</span>
          </Button>

          {user && (
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <Icons.close className="h-6 w-6" />
            ) : (
              <Icons.menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.nav
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border bg-card lg:hidden"
        >
          <div className="container py-4">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Button
                      variant={isActive ? "industrial" : "secondary"}
                      className="w-full justify-start gap-2"
                    >
                      <Icon className="h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
            {user && (
              <Button
                variant="outline"
                className="mt-4 w-full"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>
        </motion.nav>
      )}
    </header>
  );
}
