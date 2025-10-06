import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Users, Package, DollarSign, Globe, LogOut, Plug, Mail, CreditCard, Store, FileCheck, Gift, Building, User, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import bizdevLogo from "@/assets/bizdev-logo.png";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, signOut } = useAuth();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/erp", label: "ERP", icon: LayoutDashboard },
    { path: "/directory", label: "Directory", icon: Building },
    { path: "/crm", label: "CRM", icon: Users },
    { path: "/messages", label: "Messages", icon: Mail },
    { path: "/business-cards", label: "Cards", icon: CreditCard },
    { path: "/franchises", label: "Franchises", icon: Store },
    { path: "/my-applications", label: "My Applications", icon: FileCheck },
    { path: "/ai-gift-cards", label: "AI Gift Cards", icon: Gift },
    { path: "/social", label: "Network", icon: Users },
    { path: "/tools", label: "Tools", icon: Package },
    { path: "/integrations", label: "Integrations", icon: Plug },
    { path: "/funding", label: "Funding", icon: DollarSign },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isAuthenticated) return null;

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/dashboard")}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img src={bizdevLogo} alt="Biz Dev App" className="h-8 object-contain" />
            </button>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.path}
                    variant={isActive(item.path) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => navigate(item.path)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/")}
            >
              <Globe className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>

        {/* Mobile nav */}
        <div className="md:hidden flex items-center gap-1 pb-3 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                variant={isActive(item.path) ? "default" : "ghost"}
                size="sm"
                onClick={() => navigate(item.path)}
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
