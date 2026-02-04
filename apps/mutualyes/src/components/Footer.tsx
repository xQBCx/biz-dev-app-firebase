import Logo from "./Logo";

const Footer = () => {
  return (
    <footer className="bg-card/20 backdrop-blur-md border-t border-border py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <Logo size="sm" />
            <p className="text-white font-semibold mt-4 text-sm drop-shadow-md">
              Secure consent verification for safer romantic encounters. 
              Protecting all parties through verified, timestamped consent records.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white drop-shadow-md">Legal</h4>
            <ul className="space-y-2 text-sm text-white font-semibold">
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">Data Security</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4 text-white drop-shadow-md">Support</h4>
            <ul className="space-y-2 text-sm text-white font-semibold">
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors drop-shadow-sm">FAQs</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border pt-8 text-center text-sm text-white font-semibold drop-shadow-md">
          <p>&copy; 2025 Mutual Yes. All rights reserved. Protecting consent through technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
