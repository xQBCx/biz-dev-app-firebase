import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Hexagon, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useQBCScriptSafe } from '@/contexts/QBCScriptContext';
import { QBCText } from './QBCText';

const navLinks = [
  { href: '/qbc', label: 'Home' },
  { href: '/qbc/generator', label: 'Generator' },
  { href: '/qbc/docs', label: 'Documentation' },
  { href: '/qbc/pricing', label: 'Pricing' },
  { href: '/qbc/about', label: 'About' },
];

export function QBCPublicHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isQBCMode, toggleMode, isReady } = useQBCScriptSafe();

  return (
    <header className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/qbc" className="flex items-center gap-3 group">
            <div className="relative">
              <Hexagon className="h-8 w-8 text-primary logo-glow transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">Q</span>
              </div>
            </div>
            <div className="flex flex-col">
              <QBCText className="text-lg font-bold tracking-tight text-foreground text-glow-cyan">
                Quantum Bit Code
              </QBCText>
              <QBCText className="text-xs text-muted-foreground -mt-1">
                Signal Sovereignty
              </QBCText>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <QBCText>{link.label}</QBCText>
              </Link>
            ))}
          </nav>

          {/* Mode Toggle + CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* EN/QBC Mode Toggle */}
            <button
              onClick={toggleMode}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300",
                isQBCMode 
                  ? "border-primary/50 bg-primary/10" 
                  : "border-border/50 bg-muted/30 hover:bg-muted/50"
              )}
              title={isQBCMode ? "Switch to English text" : "Switch to QBC glyphs"}
            >
              <span className={cn(
                "text-xs font-medium transition-colors",
                !isQBCMode ? "text-foreground" : "text-muted-foreground"
              )}>
                EN
              </span>
              <div className={cn(
                "w-8 h-4 rounded-full relative transition-colors",
                isQBCMode ? "bg-primary" : "bg-muted"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                  isQBCMode ? "translate-x-4" : "translate-x-0.5"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isQBCMode ? "text-primary" : "text-muted-foreground"
              )}>
                QBC
              </span>
              {!isReady && (
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Loading lattice..." />
              )}
            </button>

            <Link to="/auth">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-foreground"
              >
                <QBCText>Sign In</QBCText>
              </Button>
            </Link>
            <Link to="/qbc/generator">
              <Button className="btn-qbc-primary gap-2">
                <QBCText>Try Generator</QBCText>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Compact Mode Toggle for Mobile */}
            <button
              onClick={toggleMode}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition-all duration-300",
                isQBCMode 
                  ? "border-primary/50 bg-primary/10 text-primary" 
                  : "border-border/50 bg-muted/30 text-muted-foreground"
              )}
            >
              {isQBCMode ? "QBC" : "EN"}
            </button>
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted-foreground hover:text-foreground"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/30">
            <nav className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                    location.pathname === link.href
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <QBCText>{link.label}</QBCText>
                </Link>
              ))}
              <div className="pt-4 mt-2 border-t border-border/30 flex flex-col gap-2">
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <QBCText>Sign In</QBCText>
                  </Button>
                </Link>
                <Link to="/qbc/generator" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full btn-qbc-primary">
                    <QBCText>Try Generator</QBCText>
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
