import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "@/contexts/LocationContext";
import { LocationSelector } from "@/components/LocationSelector";
import logo from "@/assets/logo.png";

export const Hero = () => {
  const navigate = useNavigate();
  const { locationConfig } = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);
  
  const handleBookNow = () => {
    navigate('/booking');
  };

  const handleCallNow = () => {
    window.location.href = locationConfig.phone;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted to-background overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 50px, hsl(var(--primary)) 50px, hsl(var(--primary)) 51px)`,
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src={logo} 
            alt="SP Details Logo" 
            className="h-72 md:h-96 w-auto drop-shadow-2xl"
          />
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
          <span className="block text-foreground">MOBILE AUTO</span>
          <span className="block text-6xl md:text-8xl mt-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            DETAILING
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-2xl md:text-3xl font-light mb-2 text-primary italic">
          We Come to You!
        </p>

        <p className="text-lg md:text-xl mb-12 text-muted-foreground max-w-2xl mx-auto">
          {locationConfig.city}'s Premier Mobile Detailing<br />
          Exotic • Luxury • Daily Drivers
        </p>

        {/* Location Selector */}
        <div className="flex justify-center mb-6">
          <LocationSelector />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            size="lg" 
            onClick={handleBookNow}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            BOOK NOW
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={handleCallNow}
            disabled={!locationConfig.available}
            className="text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            <Phone className="mr-2 h-5 w-5" />
            {locationConfig.phoneDisplay}
          </Button>
        </div>

        {/* Auth & Partner Links */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
          {isLoggedIn ? (
            <>
              <Button 
                variant="link" 
                onClick={() => navigate('/my-bookings')}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                View My Bookings
              </Button>
              <span className="text-muted-foreground hidden sm:inline">|</span>
              <Button 
                variant="link" 
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground text-sm"
              >
                Log Out
              </Button>
            </>
          ) : (
            <Button 
              variant="link" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground text-sm"
            >
              Sign In / Sign Up
            </Button>
          )}
          <span className="text-muted-foreground hidden sm:inline">|</span>
          <Button 
            variant="link" 
            onClick={() => navigate('/partner-register')}
            className="text-primary hover:text-primary/80 text-sm font-semibold"
          >
            Become a Service Partner
          </Button>
        </div>

        {/* Location */}
        <p className="text-sm text-muted-foreground">
          {locationConfig.city.toUpperCase()}, {locationConfig.state} {!locationConfig.available && '(Coming Soon)'}
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
    </section>
  );
};
