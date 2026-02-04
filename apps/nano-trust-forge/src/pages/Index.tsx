import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import MarketTiming from "@/components/MarketTiming";
import IPPortfolio from "@/components/IPPortfolio";
import TrustStrategy from "@/components/TrustStrategy";
import CapitalDeployment from "@/components/CapitalDeployment";
import Tokenization from "@/components/Tokenization";
import DigitalAssets from "@/components/DigitalAssets";
import ContactForm from "@/components/ContactForm";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <Hero />
      <MarketTiming />
      <IPPortfolio />
      <TrustStrategy />
      <CapitalDeployment />
      <DigitalAssets />
      <Tokenization />
      <ContactForm />
      
      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container px-6">
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NANO, LLC. All rights reserved.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              This presentation is for qualified investors only and does not constitute an offer to sell securities.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
