import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { Shield, Settings } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";

const Navigation = () => {
  const { isAdmin, userId } = useUserRole();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
      <div className="container px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <NavLink to="/" className="text-xl font-bold text-foreground">
            NANO, LLC
          </NavLink>
          
          <div className="flex items-center gap-4">
            {userId ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin">
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </NavLink>
                )}
                <NavLink to="/auth">
                  <Button variant="outline" size="sm">
                    Account
                  </Button>
                </NavLink>
              </>
            ) : (
              <NavLink to="/auth">
                <Button size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Investor Login
                </Button>
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
