import { Link } from 'react-router-dom';
import { Hexagon, Github, Twitter, Linkedin } from 'lucide-react';

export function QBCPublicFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/30 bg-background/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/qbc" className="flex items-center gap-2 mb-4">
              <Hexagon className="h-6 w-6 text-primary logo-glow" />
              <span className="text-lg font-bold text-foreground">QBC</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Post-quantum geometric encryption for signal sovereignty.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/qbc/generator" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Glyph Generator
                </Link>
              </li>
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link to="/qbc/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  QBC Studio
                </Link>
              </li>
            </ul>
          </div>

          {/* Technology */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Technology</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Metatron's Cube
                </Link>
              </li>
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  MESH 34 Routing
                </Link>
              </li>
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Bio-Acoustic Keys
                </Link>
              </li>
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Post-Quantum Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/qbc/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="https://bdsrvs.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Biz Dev Services
                </a>
              </li>
              <li>
                <Link to="/qbc/docs" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  API Access
                </Link>
              </li>
              <li>
                <Link to="/qbc/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Quantum Bit Code. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Managed by{' '}
            <a 
              href="https://bdsrvs.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Biz Dev Services
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
