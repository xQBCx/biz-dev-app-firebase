import { Button } from "@/components/ui/button";
import { ArrowRight, Dumbbell, Sparkles, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Hero = () => {
  const navigate = useNavigate();
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
  
  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/today');
    } else {
      navigate('/onboarding');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Red Gradient Top Section with Stripes */}
      <div className="relative flex-1 min-h-[60vh] lg:min-h-[65vh] 2xl:min-h-[70vh] flex items-center justify-center">
        {/* Base Red Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, hsl(0 85% 30%) 0%, hsl(0 85% 45%) 40%, hsl(0 70% 35%) 100%)'
          }}
        />
        
        {/* Vertical Stripes Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
          }}
        />
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 2xl:py-24 text-center">
          {/* Brand Mark */}
          <div className="inline-flex items-center gap-2 mb-6 sm:mb-8 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            <span className="text-white/90 text-xs sm:text-sm font-medium tracking-widest uppercase">Personal Training & AI Coaching</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-display font-bold mb-3 sm:mb-4 tracking-tight text-white drop-shadow-lg">
            LIMITLESS
            <span className="block bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">COACH</span>
          </h1>

          {/* Tagline */}
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl 2xl:text-4xl font-light mb-3 sm:mb-4 text-white/90 italic drop-shadow">
            Train your body. Build your life.
          </p>

          <p className="text-base sm:text-lg md:text-xl 2xl:text-2xl mb-6 sm:mb-8 text-white/80 max-w-2xl 2xl:max-w-3xl mx-auto leading-relaxed px-4">
            Personalized fitness programs, AI form analysis, and real coaching—
            <br className="hidden md:block" />
            for people ready to rebuild momentum.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 2xl:px-10 2xl:py-7 2xl:text-xl bg-white text-primary hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all group font-semibold"
            >
              {isLoggedIn ? "Go to Today" : "Start Your Journey"}
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/coaches')}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 2xl:px-10 2xl:py-7 2xl:text-xl bg-transparent border-2 border-white/50 text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all"
            >
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Find a Coach
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/gyms')}
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 2xl:px-10 2xl:py-7 2xl:text-xl bg-transparent border-2 border-white/50 text-white hover:bg-white/10 shadow-lg hover:shadow-xl transition-all"
            >
              Find a Gym
            </Button>
          </div>
        </div>
      </div>

      {/* Silver Wave SVG Divider */}
      <div className="relative h-24 md:h-32 -mt-1">
        <svg 
          viewBox="0 0 1440 120" 
          className="absolute w-full h-full"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="silverGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#E8E8E8" />
              <stop offset="30%" stopColor="#B8B8B8" />
              <stop offset="50%" stopColor="#D0D0D0" />
              <stop offset="70%" stopColor="#A0A0A0" />
              <stop offset="100%" stopColor="#C8C8C8" />
            </linearGradient>
            <linearGradient id="redAccent" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(0 85% 45%)" />
              <stop offset="100%" stopColor="hsl(0 70% 35%)" />
            </linearGradient>
          </defs>
          {/* Red background fill */}
          <rect x="0" y="0" width="1440" height="60" fill="hsl(0 70% 35%)" />
          {/* Silver wave */}
          <path 
            d="M0,40 Q360,0 720,50 T1440,40 L1440,120 L0,120 Z" 
            fill="url(#silverGradient)"
          />
          {/* Red accent line on wave */}
          <path 
            d="M0,42 Q360,2 720,52 T1440,42" 
            fill="none" 
            stroke="url(#redAccent)" 
            strokeWidth="3"
          />
          {/* Dark shadow under wave */}
          <path 
            d="M0,45 Q360,5 720,55 T1440,45" 
            fill="none" 
            stroke="rgba(0,0,0,0.3)" 
            strokeWidth="2"
          />
        </svg>
      </div>

      {/* Light Silver-Grey Bottom Section */}
      <div className="relative bg-gradient-to-b from-gray-200 via-gray-100 to-gray-200 py-10 sm:py-12 lg:py-16 2xl:py-20">
        {/* Feature Pills */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            {["AI Form Analysis", "Personalized Programs", "Nutrition Tracking", "Expert Coaching"].map((feature) => (
              <span 
                key={feature}
                className="px-3 sm:px-5 py-2 sm:py-2.5 bg-white rounded-full text-xs sm:text-sm 2xl:text-base text-foreground font-medium shadow-md border border-border"
              >
                {feature}
              </span>
            ))}
          </div>

          {/* Auth & Coach Links */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center text-muted-foreground">
            {isLoggedIn ? (
              <>
                <Button 
                  variant="link" 
                  onClick={() => navigate('/today')}
                  className="text-foreground hover:text-primary text-sm font-medium"
                >
                  My Dashboard
                </Button>
                <span className="hidden sm:inline text-border">•</span>
                <Button 
                  variant="link" 
                  onClick={handleLogout}
                  className="text-foreground hover:text-primary text-sm"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <Button 
                variant="link" 
                onClick={() => navigate('/auth')}
                className="text-foreground hover:text-primary text-sm font-medium"
              >
                Already a member? Sign In
              </Button>
            )}
            <span className="hidden sm:inline text-border">•</span>
            <Button 
              variant="link" 
              onClick={() => navigate('/coach-register')}
              className="text-primary hover:text-primary/80 text-sm font-semibold"
            >
              <Sparkles className="mr-1 h-4 w-4" />
              Become a Coach Partner
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};