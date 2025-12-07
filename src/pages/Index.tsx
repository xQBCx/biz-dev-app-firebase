import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useWhiteLabel } from "@/hooks/useWhiteLabel";
import { useEffect } from "react";
import bizdevLogo from "@/assets/bizdev-monogram.png";

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { platform, landingPage } = useWhiteLabel();

  useEffect(() => {
    if (platform === "xbuilderx") {
      navigate(landingPage);
    } else if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate, platform, landingPage]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-2xl">
        <img 
          src={bizdevLogo} 
          alt="Biz Dev" 
          className="w-20 h-20 mx-auto"
        />

        <h1 className="text-4xl md:text-5xl font-bold text-foreground">
          Biz Dev App
        </h1>
        
        <p className="text-lg text-muted-foreground">
          The Business Development Marketplace
        </p>
        
        <p className="text-sm text-muted-foreground max-w-lg mx-auto">
          Launch your verified business in hours, not months. AI-powered platform combining identity verification, automated business setup, and a complete suite of enterprise tools.
        </p>

        <Button size="lg" onClick={() => navigate("/auth")}>
          Login or Request Access
        </Button>
      </div>
    </div>
  );
}
