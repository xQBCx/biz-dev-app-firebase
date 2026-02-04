import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/sections/HeroSection";
import HomeSimulator from "@/components/home/HomeSimulator";
import ThreatSection from "@/components/sections/ThreatSection";
import ThreatResponseSection from "@/components/sections/ThreatResponseSection";
import QuantumCheckmateSection from "@/components/sections/QuantumCheckmateSection";
import DoctrineSection from "@/components/sections/DoctrineSection";
import EcosystemSection from "@/components/sections/EcosystemSection";
import QBCDeepSection from "@/components/sections/QBCDeepSection";
import MESH34DeepSection from "@/components/sections/MESH34DeepSection";
import EarthPulseLuxkeySection from "@/components/sections/EarthPulseLuxkeySection";
import BridgeSection from "@/components/sections/BridgeSection";
import CapabilitiesSection from "@/components/sections/CapabilitiesSection";
import DomainsSection from "@/components/sections/DomainsSection";
import RedTeamSection from "@/components/sections/RedTeamSection";
import IPFortressSection from "@/components/sections/IPFortressSection";
import ClosingSection from "@/components/sections/ClosingSection";
import ContactForm from "@/components/ContactForm";
import { Hexagon } from "lucide-react";
import { QBCStaticText } from "@/components/QBCDecryptedText";

const Home = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/");
      } else {
        setIsLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-primary">
          <Hexagon className="h-12 w-12" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* QBC Simulator - Immediately after hero */}
      <HomeSimulator />
      
      {/* Rest of the presentation sections */}
      <ThreatSection />
      <ThreatResponseSection />
      <QuantumCheckmateSection />
      <DoctrineSection />
      <EcosystemSection />
      <QBCDeepSection />
      <MESH34DeepSection />
      <EarthPulseLuxkeySection />
      <BridgeSection />
      <CapabilitiesSection />
      <DomainsSection />
      <RedTeamSection />
      <IPFortressSection />
      <ClosingSection />
      <ContactForm />
      
      {/* Footer */}
      <footer className="border-t border-border bg-space-void py-12">
        <div className="container px-6">
          <div className="mx-auto max-w-6xl text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-foreground">
              <Hexagon className="h-5 w-5 text-primary" />
              <span className="font-bold">
                <QBCStaticText glyphHeight="1.25rem">Quantum Bit Code</QBCStaticText>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} QBC Portfolio. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              <QBCStaticText glyphHeight="0.875rem">Signal Sovereignty</QBCStaticText>™, <QBCStaticText glyphHeight="0.875rem">MESH</QBCStaticText>™, <QBCStaticText glyphHeight="0.875rem">EarthPulse</QBCStaticText>™, <QBCStaticText glyphHeight="0.875rem">LUXKEY</QBCStaticText>™, and <QBCStaticText glyphHeight="0.875rem">FractalPulse</QBCStaticText>™ are proprietary technologies. 
              This presentation is for qualified partners only.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Contact: <a href="mailto:bill@quantumbitcode.com" className="text-primary hover:underline">bill@quantumbitcode.com</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
