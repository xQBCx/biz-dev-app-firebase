import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSelector } from "@/components/ClientSelector";

export const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="h-14 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 px-2 sm:px-4 md:px-6 w-full overflow-x-hidden">
      <SidebarTrigger className="-ml-2 shrink-0" />

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
        <ClientSelector />
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9"
          onClick={() => navigate("/")}
        >
          <Globe className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="h-9"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 md:mr-2" />
          <span className="hidden md:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};
