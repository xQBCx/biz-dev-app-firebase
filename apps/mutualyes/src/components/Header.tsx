import { Button } from "@/components/ui/button";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/40 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <nav className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/auth")}
            className="hover:bg-secondary"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90"
          >
            Get Started
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
