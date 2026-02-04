import { Dumbbell } from "lucide-react";
import { Link } from "react-router-dom";
import { NewsletterSignup } from "./NewsletterSignup";

export const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-10 sm:py-12 lg:py-16 2xl:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
              <Dumbbell className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
              <span className="text-lg sm:text-xl font-display font-bold">xCOACHx</span>
            </div>
            <p className="text-background/70 mb-4 sm:mb-6 text-sm sm:text-base">
              Train your body. Build your life.
            </p>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Programs</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/70 text-sm sm:text-base">
              <li><Link to="/programs" className="hover:text-accent transition-colors">All Programs</Link></li>
              <li><Link to="/programs?type=strength" className="hover:text-accent transition-colors">Strength</Link></li>
              <li><Link to="/programs?type=fat-loss" className="hover:text-accent transition-colors">Fat Loss</Link></li>
              <li><Link to="/programs?type=re-entry" className="hover:text-accent transition-colors">Re-Entry</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/70 text-sm sm:text-base">
              <li><Link to="/coaches" className="hover:text-accent transition-colors">Find a Coach</Link></li>
              <li><Link to="/gyms" className="hover:text-accent transition-colors">Find a Gym</Link></li>
              <li><Link to="/nutrition" className="hover:text-accent transition-colors">Nutrition Guide</Link></li>
              <li><Link to="/form-tips" className="hover:text-accent transition-colors">Form Tips</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 sm:space-y-3 text-background/70 text-sm sm:text-base">
              <li><Link to="/about" className="hover:text-accent transition-colors">About</Link></li>
              <li><Link to="/coach-register" className="hover:text-accent transition-colors">Become a Coach</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-background/20 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8">
          <div className="max-w-md mx-auto md:mx-0">
            <h4 className="font-semibold mb-2 text-sm sm:text-base">Weekly Tips from Coach Bill</h4>
            <p className="text-background/70 text-sm mb-3">No-BS fitness advice. No spam, just gains.</p>
            <NewsletterSignup source="footer" variant="minimal" />
          </div>
        </div>

        <div className="border-t border-background/20 mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-background/60">
              © {new Date().getFullYear()} xCOACHx. All rights reserved.
            </p>
            <p className="text-xs text-background/40 max-w-xl text-center md:text-right">
              xCOACHx provides fitness education and motivation. Not medical advice. 
              Consult physician for health concerns. Viome/Fountain Life are independent services.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};