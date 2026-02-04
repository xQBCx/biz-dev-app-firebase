import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Building2, CreditCard, QrCode, Shield } from "lucide-react";
import logo from "@/assets/logo.png";

const Index = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/merchant");
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8 mb-16">
          <div className="flex justify-center">
            <img src={logo} alt="BizDev Logo" className="h-24 w-24 shadow-glow" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            BizDev Merchant Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline digital asset payment onboarding for local businesses. 
            Create payment links, generate QR codes, and manage merchants all in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90 shadow-glow"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-16">
          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <Building2 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Merchant Onboarding</CardTitle>
              <CardDescription>
                Set up new merchants in under 5 minutes with automated account creation
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <CreditCard className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Payment Links</CardTitle>
              <CardDescription>
                Generate instant payment links for various use cases from deposits to fees
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <QrCode className="h-12 w-12 text-primary mb-4" />
              <CardTitle>QR Codes</CardTitle>
              <CardDescription>
                Automatically generate high-resolution QR codes for easy customer payments
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-card border-border hover:shadow-glow transition-all duration-300">
            <CardHeader>
              <Shield className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Multi-Processor</CardTitle>
              <CardDescription>
                Support for Coinbase Commerce, BitPay, and Strike with secure API integration
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="bg-gradient-card border-border max-w-4xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Start?</CardTitle>
            <CardDescription className="text-lg">
              Join the future of business payments
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="bg-primary hover:bg-primary/90"
            >
              Sign In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;