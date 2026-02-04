import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const navigate = useNavigate();
  
  const handleBookNow = () => {
    navigate('/booking');
  };

  const handleCallNow = () => {
    window.location.href = 'tel:7132816030';
  };

  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo and Tagline */}
          <div className="text-center md:text-left">
            <img 
              src={logo} 
              alt="SP Details Logo" 
              className="h-16 w-auto mb-4 mx-auto md:mx-0"
            />
            <p className="text-sm text-muted-foreground italic">
              Premium Mobile Detailing
            </p>
          </div>

          {/* Contact Info */}
          <div className="text-center">
            <h3 className="font-bold mb-4 text-lg">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <a href="tel:7132816030" className="hover:text-primary transition-colors">
                  (713) 281-6030
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Globe className="h-4 w-4" />
                <a 
                  href="https://spdetailshtx.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  spdetailshtx.com
                </a>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>Houston, TX</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center md:text-right">
            <h3 className="font-bold mb-4 text-lg">Ready to Book?</h3>
            <Button 
              size="lg"
              onClick={handleBookNow}
              className="w-full md:w-auto"
            >
              BOOK NOW
            </Button>
            <p className="text-sm text-muted-foreground mt-3">
              California: Coming Soon
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SP Details. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
