import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Menu, X, Rocket } from "lucide-react";
import { SkipToContent } from "@/components/accessibility/SkipToContent";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: "About", href: "/about" },
    { name: "Who We Manage", href: "/who-we-manage" },
    { name: "Partner With Us", href: "/partner-with-us" },
    { name: "Academy", href: "/academy" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-slate-200">
      <SkipToContent />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="group flex items-center space-x-2 sm:space-x-3 transition-all duration-300 hover:scale-105">
            <div className="relative">
              {/* Rocket Container with Glow Effect */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-700 rounded-xl flex items-center justify-center shadow-2xl group-hover:shadow-purple-500/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 relative overflow-hidden">
                {/* Glossy overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 via-white/10 to-transparent rounded-xl"></div>
                {/* Inner glow */}
                <div className="absolute inset-1 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-lg blur-sm"></div>
                <Rocket className="h-5 w-5 sm:h-6 sm:w-6 text-white relative z-10 drop-shadow-lg group-hover:rotate-12 transition-transform duration-300" />
              </div>
              {/* Floating particles effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute -top-1 -left-1 w-1 h-1 bg-blue-300 rounded-full animate-pulse"></div>
                <div className="absolute -top-2 right-1 w-1.5 h-1.5 bg-purple-300 rounded-full animate-pulse delay-300"></div>
                <div className="absolute -bottom-1 -left-2 w-1 h-1 bg-blue-200 rounded-full animate-pulse delay-500"></div>
              </div>
            </div>
            
            {/* Brand Text with Enhanced Styling */}
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent tracking-tight group-hover:tracking-wide transition-all duration-300">
                SMARTLINK
              </span>
              <span className="text-xs text-slate-500 font-medium tracking-widest uppercase -mt-1 group-hover:text-slate-400 transition-colors duration-300 hidden sm:block">
                Property OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm xl:text-base font-semibold transition-colors hover:text-primary ${
                  isActive(item.href)
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* SmartLink OS Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`text-sm xl:text-base font-semibold transition-all duration-300 ${
                    isActive("/smartlink-os") || isActive("/coming-soon")
                      ? "text-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 rounded-lg px-2 py-1.5"
                      : "text-muted-foreground hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 rounded-lg px-2 py-1.5"
                  }`}
                >
                  SmartLink OS
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" className="w-64 bg-white border-2 border-blue-200/30 shadow-2xl rounded-xl p-2 z-50">
                <DropdownMenuItem asChild>
                  <Link to="/smartlink-os" className="cursor-pointer rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">OS</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-blue-600">Platform Overview</div>
                      <div className="text-xs text-slate-500 group-hover:text-blue-500">Explore all features</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/coming-soon" className="cursor-pointer rounded-lg p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">⚡</span>
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800 group-hover:text-purple-600">Dashboard Login</div>
                      <div className="text-xs text-slate-500 group-hover:text-purple-500">Access your account</div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Login Button & Mobile Menu */}
          <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
            <Button 
              variant="outline" 
              size="lg" 
              className="hidden lg:inline-flex font-semibold text-base xl:text-lg px-4 xl:px-6 py-2 xl:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300" 
              asChild
            >
              <Link to="/coming-soon">Log In</Link>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              ) : (
                <Menu className="h-5 w-5 sm:h-6 sm:w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 sm:py-6 border-t border-border">
            <nav className="flex flex-col space-y-4 sm:space-y-6">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-base sm:text-lg font-semibold transition-colors hover:text-primary min-h-[44px] flex items-center ${
                    isActive(item.href)
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/smartlink-os"
                className={`text-base sm:text-lg font-semibold transition-colors hover:text-primary min-h-[44px] flex items-center ${
                  isActive("/smartlink-os")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SmartLink OS Overview
              </Link>
              <Link
                to="/coming-soon"
                className={`text-base sm:text-lg font-semibold transition-colors hover:text-primary min-h-[44px] flex items-center ${
                  isActive("/coming-soon")
                    ? "text-primary"
                    : "text-muted-foreground"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in to Dashboard
              </Link>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-fit font-semibold text-base sm:text-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 min-h-[44px]" 
                asChild
              >
                <Link to="/coming-soon">Log In</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;