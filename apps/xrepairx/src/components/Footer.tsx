import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { XRepairxLogo } from "@/components/XRepairxLogo";

export const Footer = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/request-support');
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left">
            <div className="flex justify-center md:justify-start mb-4">
              <XRepairxLogo size="lg" />
            </div>
            <p className="text-sm text-muted-foreground italic">
              On-Demand Repair, Anywhere
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h3 className="font-bold mb-4 text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <a href="mailto:support@xrepairx.com" className="hover:text-primary transition-colors">
                  support@xrepairx.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a 
                  href="https://xrepairx.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  xrepairx.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Nationwide Service</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center md:text-right">
            <h3 className="font-bold mb-4 text-lg">Ready to Get Started?</h3>
            <Button 
              size="lg"
              onClick={handleGetStarted}
              className="w-full md:w-auto"
            >
              REQUEST SUPPORT
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              AI-Powered Part Discovery & Remote Guidance
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} xREPAIRx. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
