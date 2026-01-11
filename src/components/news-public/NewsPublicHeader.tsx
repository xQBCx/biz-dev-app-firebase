import { Link, NavLink } from "react-router-dom";
import { Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const categories = [
  { label: "Interviews", path: "/news?category=interview" },
  { label: "Tech Briefs", path: "/news?category=tech_brief" },
  { label: "Business News", path: "/news?category=news" },
  { label: "Insights", path: "/news?category=analysis" },
];

export const NewsPublicHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[hsl(var(--news-bg))]/95 backdrop-blur-md border-b border-[hsl(var(--news-border))]">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-4">
          <Link to="/news" className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-semibold tracking-tight text-[hsl(var(--news-text))]">
              BizDev<span className="text-[hsl(var(--news-muted))]">.</span>news
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-[hsl(var(--news-text))] hover:text-[hsl(var(--news-accent))]"
            >
              <Search className="h-5 w-5" />
            </Button>
            
            <Button 
              className="hidden md:flex bg-[hsl(var(--news-accent))] hover:bg-[hsl(var(--news-accent))]/90 text-[hsl(var(--news-accent-foreground))] font-medium"
            >
              Subscribe
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-[hsl(var(--news-text))]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Category navigation - Desktop */}
        <nav className="hidden md:flex items-center gap-8 py-3 border-t border-[hsl(var(--news-border))]">
          {categories.map((cat) => (
            <NavLink
              key={cat.path}
              to={cat.path}
              className={({ isActive }) =>
                `text-sm font-medium tracking-wide uppercase transition-colors ${
                  isActive 
                    ? "text-[hsl(var(--news-accent))]" 
                    : "text-[hsl(var(--news-muted))] hover:text-[hsl(var(--news-text))]"
                }`
              }
            >
              {cat.label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-[hsl(var(--news-border))] space-y-4">
            {categories.map((cat) => (
              <NavLink
                key={cat.path}
                to={cat.path}
                className="block text-sm font-medium tracking-wide uppercase text-[hsl(var(--news-muted))] hover:text-[hsl(var(--news-text))] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {cat.label}
              </NavLink>
            ))}
            <Button 
              className="w-full bg-[hsl(var(--news-accent))] hover:bg-[hsl(var(--news-accent))]/90 text-[hsl(var(--news-accent-foreground))] font-medium"
            >
              Subscribe
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};
