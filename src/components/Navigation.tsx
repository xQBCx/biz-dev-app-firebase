import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import bizdevMonogram from "@/assets/bizdev-monogram.png";

export const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="h-16 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated px-6">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <img 
          src={bizdevMonogram} 
          alt="Biz Dev App" 
          className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => navigate("/dashboard")}
        />
      </div>

      <div className="flex items-center gap-3">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/profile")}
        >
          <User className="w-4 h-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate("/")}
        >
          <Globe className="w-4 h-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={signOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};
