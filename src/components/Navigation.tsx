import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Globe, LogOut, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ClientSelector } from "@/components/ClientSelector";
import { QBCModeToggle } from "@/components/qbc/QBCModeToggle";

export const Navigation = () => {
  const navigate = useNavigate();
  const { isAuthenticated, signOut } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <header className="h-12 flex items-center justify-between border-b border-border bg-background sticky top-0 z-50 px-4">
      <SidebarTrigger className="-ml-2 shrink-0" />

      <div className="flex items-center gap-2">
        <QBCModeToggle variant="icon" />
        <ClientSelector />
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/profile")}
        >
          <User className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8"
          onClick={() => navigate("/")}
        >
          <Globe className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={signOut}
        >
          <LogOut className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>
    </header>
  );
};
