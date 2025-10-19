import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import bizdevLogo from "@/assets/bizdev-monogram.png";
export default function Index() {
  const navigate = useNavigate();
  const {
    isAuthenticated
  } = useAuth();
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  return <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-4xl">
        <Button size="lg" onClick={() => navigate("/auth")} className="mb-8 bg-slate-200 text-slate-900 hover:bg-slate-300">
          Login or Request Access
        </Button>

        <div className="mb-12">
          <img src={bizdevLogo} alt="Biz Dev" className="w-32 h-32 mx-auto rounded-2xl border-4 border-primary/30" />
        </div>

        <h1 className="text-6xl md:text-8xl font-bold text-white">
          Biz Dev App
        </h1>
        
        <p className="text-2xl md:text-3xl text-slate-300">The Business Development Marketplace</p>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto px-4">
          Launch your verified business in hours, not months. AI-powered platform combining identity verification, automated business setup, and a complete suite of enterprise tools.
        </p>
      </div>
    </div>;
}